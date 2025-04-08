import { defineInterface } from "@directus/extensions-sdk";

import InterfaceComponent from "./interface.vue";

export default defineInterface({
  id: "search-collection-item",
  name: "Search Collection Item",
  icon: "search",
  group: "selection",
  description: "Autocomplete search for collection items",
  component: InterfaceComponent,
  options: [
    {
      field: "placeholder",
      name: "Placeholder",
      type: "string",
      meta: {
        width: "half",
        interface: "input",
        options: {
          placeholder: "Enter placeholder text...",
        },
      },
    },
    {
      field: "field_collection",
      name: "Collection",
      type: "string",
      meta: {
        width: "half",
        interface: "system-collection",
        options: {
          includeSystem: false,
        },
        note: "Choose the collection to search for items in.",
      },
    },
  ],
  types: ["string"],
});
