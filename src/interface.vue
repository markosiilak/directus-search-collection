<template>
  <div>
    <div v-if="!isNewItem" class="search-container">
      <div class="custom-select" @click="toggleSelect">
        <div class="select-header">
          <span>{{ selectedOption.text }}</span>
          <v-icon :name="isOpen ? 'expand_less' : 'expand_more'" />
        </div>
        <div v-if="isOpen" class="select-dropdown">
          <div
            v-for="option in searchOptions"
            :key="option.value"
            class="select-option"
            :class="{ 'selected': option.value === searchType }"
            @click="selectOption(option)"
          >
            {{ option.text }}
          </div>
        </div>
      </div>

      <v-input
        v-model="inputValue"
        :placeholder="`Search by ${searchType === 'name' ? 'event name' : 'event ID'}...`"
        :disabled="isNewItem"
        @input="updateValue($event)">
        <template #prepend>
          <v-icon name="search" />
        </template>
      </v-input>
    </div>
    <v-notice v-if="isNewItem">
      Save the item first to enable search functionality
    </v-notice>
    <v-list v-if="showList && inputValue">
      <v-list-item v-for="item in items" :key="item.id" @click="selectItem(item)">
        <v-list-item-content>
          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup lang="ts">
  import { useApi } from "@directus/extensions-sdk";
  import { onMounted, ref } from 'vue';

  interface Item {
    id: string;
    name: string;
    slug?: string;
    category?: {
      name: string;
    };
    image?: string;
    description?: string;
    event_id?: string;
  }

  interface Props {
    value: string;
    placeholder?: string;
    collection?: string;
    fieldCollection?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    placeholder: "Search for an event",
    fieldCollection: "event"
  });

  const emit = defineEmits(['input']);

  const inputValue = ref(props.value);
  const items = ref<Item[]>([]);
  const api = ref(useApi());
  const showList = ref(false);
  const isNewItem = ref(false);
  const searchType = ref('name');
  const allEvents = ref<Item[]>([]);
  const isOpen = ref(false);
  const searchOptions = [
    { text: 'Name', value: 'name' },
    { text: 'Event ID', value: 'event_id' }
  ];
  const selectedOption = ref(searchOptions[0]);

  const toggleSelect = () => {
    isOpen.value = !isOpen.value;
  };

  const selectOption = (option: { text: string; value: string }) => {
    selectedOption.value = option;
    searchType.value = option.value;
    isOpen.value = false;
  };

  onMounted(() => {
    const currentItemId = window.location.pathname.split("/").pop();
    isNewItem.value = currentItemId === '+';

    document.addEventListener('click', (event) => {
      const select = document.querySelector('.custom-select');
      if (select && !select.contains(event.target as Node)) {
        isOpen.value = false;
      }
    });
  });

  const updateValue = async (event: string | Event): Promise<void> => {
    const value = typeof event === 'string' ? event : (event.target as HTMLInputElement).value;
    inputValue.value = value;
    emit("input", value);
    await searchEvents();
    showList.value = true;
  };

  const searchEvents = async (): Promise<void> => {
    if (allEvents.value.length === 0) {
      try {
        const { data } = await api.value.get(`/items/${props.fieldCollection}`, {
          params: {
            fields: ['id', 'name', 'event_id', 'image', 'category.name'],
            limit: -1
          }
        });
        allEvents.value = data.data || [];
      } catch (error) {
        console.error("Error fetching events:", error);
        items.value = [];
        return;
      }
    }

    if (!inputValue.value) {
      items.value = [];
      return;
    }

    const query = inputValue.value.toLowerCase();
    items.value = allEvents.value
      .filter(event => {
        if (searchType.value === 'name') {
          return event?.name?.toLowerCase().includes(query);
        } else {
          return event?.event_id?.toLowerCase().includes(query);
        }
      })
      .slice(0, 10);
  };

  const selectItem = async (item: Item): Promise<void> => {
    await addNewItem(item.name);

    inputValue.value = item.name;
    showList.value = false;

    const currentItemId = window.location.pathname.split("/").pop();

    const values = {
      title: item.name,
      url: `/events/${item.category?.name?.toLowerCase() || 'general'}/${item.id}/${item.slug || ''}`,
      image: item.image,
    };

    api.value
      .patch(`/items/${props.collection}/${currentItemId}`, values)
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error updating item:", error);
      });
  };

  const addNewItem = async (value: string): Promise<void> => {
    if (!api.value) {
      console.error("API is not initialized");
      return;
    }

    try {
      const { data } = await api.value.get(`/items/${props.fieldCollection}`, {
        params: {
          fields: ['id', 'name'],
          filter: {
            name: {
              _eq: value
            }
          }
        }
      });

      // If item doesn't exist, create it
      if (!data.data || data.data.length === 0) {
        const newItem = {
          name: value,
          status: 'published'
        };

        const response = await api.value.post(`/items/${props.fieldCollection}`, newItem);
        items.value = [...items.value, response.data.data];
      }
    } catch (error) {
      console.error("Error adding new item:", error);
    }
  };
</script>

<style lang="scss">
.search-container {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.custom-select {
  position: relative;
  width: 120px;
  user-select: none;
  display: flex;
  align-items: center;

  .select-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--background-input);
    border: 2px solid var(--border-normal);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--border-normal-alt);
    }
  }

  .select-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: var(--background-input);
    border: 2px solid var(--border-normal);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }

  .select-option {
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--background-normal);
    }

    &.selected {
      background-color: var(--background-normal-alt);
      color: var(--primary);
    }
  }
}
</style>
