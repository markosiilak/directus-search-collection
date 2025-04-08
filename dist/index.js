import { useApi, useStores, defineInterface } from '@directus/extensions-sdk';
import { defineComponent, ref, computed, onMounted, onUnmounted, watch, resolveComponent, resolveDirective, openBlock, createElementBlock, createBlock, normalizeClass, withCtx, createCommentVNode, createElementVNode, toDisplayString, withDirectives, createVNode } from 'vue';

var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
const _hoisted_1 = { class: "slug-generator" };
const _hoisted_2 = {
  key: 1,
  class: "slug-preview-mode"
};
const _hoisted_3 = { class: "action-buttons" };
const _hoisted_4 = {
  key: 2,
  class: "validation-message"
};
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "interface",
  props: {
    value: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    select_collection: {
      type: String,
      default: null
    },
    select_field: {
      type: String,
      default: null
    },
    auto: {
      type: Boolean,
      default: true
    },
    required: {
      type: Boolean,
      default: true
    },
    separator: {
      type: String,
      default: "-"
    },
    lowercase: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: "Enter a slug..."
    },
    collection: {
      type: String,
      required: true
    },
    field: {
      type: String,
      required: true
    },
    primaryKey: {
      type: [String, Number],
      default: null
    },
    custom_empty_message: {
      type: String,
      default: null
    },
    custom_format_message: {
      type: String,
      default: null
    },
    custom_unique_message: {
      type: String,
      default: null
    }
  },
  emits: ["input", "validation"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const api = useApi();
    const { items: itemsStore } = useStores();
    const internalValue = ref(props.value || "");
    const isValid = ref(true);
    const validationMessage = ref("");
    const sourceValue = ref("");
    const isEditing = ref(false);
    const cachedValueBeforeEdit = ref("");
    const checkSlugUniqueness = async (slug) => {
      var _a, _b;
      if (!props.collection || !slug) return true;
      try {
        const isTranslationCollection = props.collection.endsWith("_translations");
        if (isTranslationCollection) {
          const baseCollection = props.collection.replace("_translations", "");
          if (!props.primaryKey) return true;
          const currentItem = await api.get(`/items/${props.collection}/${props.primaryKey}`);
          const parentId = (_b = (_a = currentItem == null ? void 0 : currentItem.data) == null ? void 0 : _a.data) == null ? void 0 : _b[`${baseCollection}_id`];
          if (!parentId) return true;
          const response = await api.get(`/items/${props.collection}`, {
            params: {
              filter: __spreadValues({
                [props.field]: { _eq: slug },
                [`${baseCollection}_id`]: { _neq: parentId }
              }, props.primaryKey && { id: { _neq: props.primaryKey } }),
              limit: 1
            }
          });
          return response.data.data.length === 0;
        } else {
          const response = await api.get(`/items/${props.collection}`, {
            params: {
              filter: __spreadValues({
                [props.field]: { _eq: slug }
              }, props.primaryKey && { id: { _neq: props.primaryKey } }),
              limit: 1
            }
          });
          return response.data.data.length === 0;
        }
      } catch (error) {
        console.error("Error checking slug uniqueness:", error);
        return true;
      }
    };
    const validateSlug = async () => {
      if (!internalValue.value) {
        if (props.required) {
          isValid.value = false;
          validationMessage.value = props.custom_empty_message || "Slug cannot be empty. Please enter a valid slug.";
          emit("validation", false);
          return;
        } else {
          isValid.value = true;
          validationMessage.value = "";
          emit("validation", true);
          return;
        }
      }
      const updatedSlugPattern = /^[\/]?[a-z0-9]+(?:[-\/][a-z0-9]+)*\/?$/;
      if (!updatedSlugPattern.test(internalValue.value)) {
        isValid.value = false;
        validationMessage.value = props.custom_format_message || "Slug must contain only lowercase letters, numbers, hyphens, and forward slashes. It can start and end with a forward slash for paths.";
        emit("validation", false);
        return;
      }
      const isUnique = await checkSlugUniqueness(internalValue.value);
      if (!isUnique) {
        isValid.value = false;
        validationMessage.value = props.custom_unique_message || "This slug is already in use. Please enter a unique slug.";
        emit("validation", false);
        return;
      }
      isValid.value = true;
      validationMessage.value = "";
      emit("validation", true);
    };
    computed(() => {
      if (!internalValue.value) return "";
      return internalValue.value;
    });
    const createSlug = (text) => {
      if (!text || typeof text !== "string") return "";
      let slug = props.lowercase ? text.toLowerCase() : text;
      slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9\-\/ ]/g, "").trim().replace(/\s+/g, props.separator);
      slug = slug.replace(new RegExp(`${props.separator}+`, "g"), props.separator);
      slug = slug.replace(/\/+/g, "/");
      const hasTrailingSlash = slug.endsWith("/");
      const hasLeadingSlash = slug.startsWith("/");
      slug = slug.replace(new RegExp(`^${props.separator}|${props.separator}$`, "g"), "");
      if (hasLeadingSlash && !slug.startsWith("/")) {
        slug = "/" + slug;
      }
      if (hasTrailingSlash && !slug.endsWith("/")) {
        slug = slug + "/";
      }
      return slug;
    };
    const processInput = async (value) => {
      const inputValue = typeof value === "string" ? value : value && typeof value === "object" && value.target ? value.target.value : "";
      if (inputValue === "" && props.auto && selectedSourceField.value) {
        await fetchSourceValue();
        if (sourceValue.value) {
          const sourceText = String(sourceValue.value);
          internalValue.value = createSlug(sourceText);
        } else {
          internalValue.value = "";
        }
      } else if (inputValue && props.auto && !cachedValueBeforeEdit.value) {
        internalValue.value = createSlug(inputValue);
      } else {
        internalValue.value = inputValue;
      }
      validateSlug();
      emit("input", internalValue.value);
    };
    const onKeyPress = (event) => {
      if (event.key === "Escape") {
        internalValue.value = cachedValueBeforeEdit.value;
        disableEdit();
      } else if (event.key === "Enter") {
        disableEdit();
      }
    };
    const enableEdit = () => {
      if (props.disabled) return;
      cachedValueBeforeEdit.value = internalValue.value;
      isEditing.value = true;
      if (!internalValue.value) {
        internalValue.value = props.value || "";
      }
    };
    const disableEdit = () => {
      isEditing.value = false;
      validateSlug();
    };
    const selectedSourceField = computed(() => {
      return props.select_field || props.select_collection;
    });
    const fetchSourceValue = async () => {
      if (!props.primaryKey || !selectedSourceField.value) return;
      try {
        const fieldParts = selectedSourceField.value.split(".");
        if (fieldParts.length === 1) {
          if (props.collection && props.primaryKey && (itemsStore == null ? void 0 : itemsStore.getItem)) {
            try {
              const item = itemsStore.getItem(props.collection, props.primaryKey);
              if (item && item[fieldParts[0]] !== void 0) {
                sourceValue.value = item[fieldParts[0]];
                return;
              }
            } catch (storeError) {
              console.debug("Could not get item from store, trying API:", storeError);
            }
          }
          try {
            const isTranslation = props.select_collection && props.select_collection.includes("_translations");
            let collection = props.select_collection || props.collection;
            let primaryKey = props.primaryKey;
            if (isTranslation) {
              const baseCollection = collection.replace("_translations", "");
              const translationResponse = await api.get(`/items/${collection}`, {
                params: {
                  filter: {
                    [`${baseCollection}_id`]: { _eq: props.primaryKey }
                  },
                  limit: 1
                }
              });
              if (translationResponse.data.data && translationResponse.data.data.length > 0) {
                primaryKey = translationResponse.data.data[0].id;
              } else {
                console.warn(`No translation found for ${baseCollection} with ID ${props.primaryKey}`);
                return;
              }
            }
            const response = await api.get(`/items/${collection}/${primaryKey}`, {
              params: {
                fields: [fieldParts[0]]
              }
            });
            if (response.data.data && response.data.data[fieldParts[0]] !== void 0) {
              sourceValue.value = response.data.data[fieldParts[0]];
            }
          } catch (apiError) {
            if (apiError.response && apiError.response.status === 403) {
              console.warn(`Permission denied: Cannot access field "${fieldParts[0]}" in collection "${props.select_collection || props.collection}"`, apiError);
            } else {
              console.error("API error:", apiError);
            }
          }
        } else if (fieldParts.length > 1) {
          const relationCollection = fieldParts[0];
          const relationField = fieldParts[1];
          try {
            const response = await api.get(`/items/${relationCollection}`, {
              params: {
                filter: {
                  [`${props.collection}_id`]: { _eq: props.primaryKey }
                },
                fields: [relationField],
                limit: 1
              }
            });
            if (response.data.data && response.data.data.length > 0 && response.data.data[0][relationField] !== void 0) {
              sourceValue.value = response.data.data[0][relationField];
            }
          } catch (apiError) {
            if (apiError.response && apiError.response.status === 403) {
              console.warn(`Permission denied: Cannot access field "${relationField}" in collection "${relationCollection}"`, apiError);
            } else {
              console.error("API error fetching relational field:", apiError);
            }
          }
        }
      } catch (error) {
        console.error("Error in fetchSourceValue:", error);
      }
    };
    const regenerateSlug = async () => {
      if (selectedSourceField.value) {
        await fetchSourceValue();
        if (sourceValue.value) {
          const sourceText = String(sourceValue.value);
          internalValue.value = createSlug(sourceText);
          await validateSlug();
          emit("input", internalValue.value);
        } else {
          console.warn("Could not regenerate slug: No source value available");
        }
      }
    };
    const validationIntervalRef = ref(null);
    const updateValidationUI = () => {
      const headerBar = document.querySelector(".header-bar");
      if (!isValid.value) {
        if (headerBar) {
          headerBar.classList.add("slug-validation-error");
          const headerBarButtons = headerBar.querySelectorAll("button:not(.slug-generator button)");
          headerBarButtons.forEach((button) => {
            button.disabled = true;
            button.setAttribute("data-disabled-by-slug", "true");
          });
        }
      } else {
        const disabledButtons = document.querySelectorAll('[data-disabled-by-slug="true"]');
        disabledButtons.forEach((button) => {
          button.disabled = false;
          button.removeAttribute("data-disabled-by-slug");
        });
        if (headerBar) {
          headerBar.classList.remove("slug-validation-error");
        }
      }
    };
    onMounted(async () => {
      if ((!internalValue.value || internalValue.value === "") && props.auto && selectedSourceField.value && props.primaryKey) {
        await fetchSourceValue();
        if (sourceValue.value) {
          const sourceText = String(sourceValue.value);
          internalValue.value = createSlug(sourceText);
          await validateSlug();
          emit("input", internalValue.value);
        }
      }
      await validateSlug();
      validationIntervalRef.value = setInterval(() => {
        updateValidationUI();
      }, 1e3);
    });
    onUnmounted(() => {
      if (validationIntervalRef.value) {
        clearInterval(validationIntervalRef.value);
      }
    });
    watch(internalValue, () => {
      validateSlug();
      updateValidationUI();
    });
    watch(() => props.value, (newVal) => {
      if (newVal !== internalValue.value) {
        internalValue.value = newVal || "";
        validateSlug();
      }
    });
    watch(
      () => {
        if (props.primaryKey && props.collection && (itemsStore == null ? void 0 : itemsStore.getItem)) {
          try {
            const item = itemsStore.getItem(props.collection, props.primaryKey);
            if (item && selectedSourceField.value && !selectedSourceField.value.includes(".")) {
              return item[selectedSourceField.value];
            }
          } catch (error) {
            console.error("Error accessing itemsStore:", error);
          }
        }
        return null;
      },
      async (newSourceValue) => {
        if (newSourceValue && props.auto && (!internalValue.value || internalValue.value === "")) {
          sourceValue.value = newSourceValue;
          const sourceText = String(newSourceValue);
          internalValue.value = createSlug(sourceText);
          await validateSlug();
          emit("input", internalValue.value);
        }
      }
    );
    watch(
      () => props.select_field,
      async (newSelectField, oldSelectField) => {
        if (newSelectField !== oldSelectField && props.auto && props.primaryKey) {
          await fetchSourceValue();
          if (sourceValue.value) {
            const sourceText = String(sourceValue.value);
            internalValue.value = createSlug(sourceText);
            await validateSlug();
            emit("input", internalValue.value);
          }
        }
      }
    );
    watch(
      () => props.select_collection,
      async (newCollection, oldCollection) => {
        if (newCollection !== oldCollection && props.auto && props.primaryKey) {
          await fetchSourceValue();
          if (sourceValue.value) {
            const sourceText = String(sourceValue.value);
            internalValue.value = createSlug(sourceText);
            await validateSlug();
            emit("input", internalValue.value);
          }
        }
      }
    );
    watch(
      () => {
        if (props.primaryKey && props.collection && (itemsStore == null ? void 0 : itemsStore.getItem)) {
          try {
            const item = itemsStore.getItem(props.collection, props.primaryKey);
            if (item && selectedSourceField.value) {
              return {
                value: !selectedSourceField.value.includes(".") ? item[selectedSourceField.value] : null,
                field: selectedSourceField.value
              };
            }
          } catch (error) {
            console.error("Error accessing itemsStore:", error);
          }
        }
        return { value: null, field: null };
      },
      async (newSource, oldSource) => {
        if (newSource.value && newSource.value !== oldSource.value || newSource.field !== oldSource.field && newSource.field) {
          if (props.auto) {
            sourceValue.value = newSource.value;
            const sourceText = String(newSource.value);
            internalValue.value = createSlug(sourceText);
            await validateSlug();
            emit("input", internalValue.value);
          }
        }
      },
      { deep: true }
    );
    return (_ctx, _cache) => {
      const _component_v_icon = resolveComponent("v-icon");
      const _component_v_input = resolveComponent("v-input");
      const _component_v_button = resolveComponent("v-button");
      const _directive_tooltip = resolveDirective("tooltip");
      return openBlock(), createElementBlock("div", _hoisted_1, [
        isEditing.value ? (openBlock(), createBlock(_component_v_input, {
          key: 0,
          modelValue: internalValue.value,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => internalValue.value = $event),
          placeholder: __props.placeholder,
          disabled: __props.disabled,
          class: normalizeClass({ "has-error": !isValid.value }),
          onInput: processInput,
          onBlur: disableEdit,
          onKeydown: onKeyPress,
          autofocus: ""
        }, {
          append: withCtx(() => [
            internalValue.value ? (openBlock(), createBlock(_component_v_icon, {
              key: 0,
              name: isValid.value ? "check" : "warning",
              class: normalizeClass(isValid.value ? "valid-icon" : "invalid-icon")
            }, null, 8, ["name", "class"])) : createCommentVNode("v-if", true)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["modelValue", "placeholder", "disabled", "class"])) : (openBlock(), createElementBlock("div", _hoisted_2, [
          createElementVNode(
            "span",
            {
              class: "slug-display",
              onClick: _cache[1] || (_cache[1] = ($event) => !__props.disabled && enableEdit)
            },
            toDisplayString(internalValue.value || __props.placeholder),
            1
            /* TEXT */
          ),
          createElementVNode("div", _hoisted_3, [
            !__props.disabled ? withDirectives((openBlock(), createBlock(_component_v_button, {
              key: 0,
              "x-small": "",
              secondary: "",
              icon: "",
              class: "action-button",
              onClick: enableEdit
            }, {
              default: withCtx(() => [
                createVNode(_component_v_icon, { name: "edit" })
              ]),
              _: 1
              /* STABLE */
            })), [
              [_directive_tooltip, "Edit slug"]
            ]) : createCommentVNode("v-if", true),
            selectedSourceField.value && __props.auto ? withDirectives((openBlock(), createBlock(_component_v_button, {
              key: 1,
              "x-small": "",
              secondary: "",
              icon: "",
              class: "action-button",
              onClick: regenerateSlug
            }, {
              default: withCtx(() => [
                createVNode(_component_v_icon, { name: "autorenew" })
              ]),
              _: 1
              /* STABLE */
            })), [
              [_directive_tooltip, "Regenerate from source"]
            ]) : createCommentVNode("v-if", true)
          ])
        ])),
        !isValid.value ? (openBlock(), createElementBlock(
          "div",
          _hoisted_4,
          toDisplayString(validationMessage.value),
          1
          /* TEXT */
        )) : createCommentVNode("v-if", true)
      ]);
    };
  }
});

var e=[],t=[];function n(n,r){if(n&&"undefined"!=typeof document){var a,s=!0===r.prepend?"prepend":"append",d=!0===r.singleTag,i="string"==typeof r.container?document.querySelector(r.container):document.getElementsByTagName("head")[0];if(d){var u=e.indexOf(i);-1===u&&(u=e.push(i)-1,t[u]={}),a=t[u]&&t[u][s]?t[u][s]:t[u][s]=c();}else a=c();65279===n.charCodeAt(0)&&(n=n.substring(1)),a.styleSheet?a.styleSheet.cssText+=n:a.appendChild(document.createTextNode(n));}function c(){var e=document.createElement("style");if(e.setAttribute("type","text/css"),r.attributes)for(var t=Object.keys(r.attributes),n=0;n<t.length;n++)e.setAttribute(t[n],r.attributes[t[n]]);var a="prepend"===s?"afterbegin":"beforeend";return i.insertAdjacentElement(a,e),e}}

var css = "\n.slug-generator[data-v-bf2968ae] {\n  width: 100%;\n}\n.validation-message[data-v-bf2968ae] {\n  margin-top: 4px;\n  font-size: 12px;\n  color: var(--danger);\n}\n.slug-preview-mode[data-v-bf2968ae] {\n  display: flex;\n  align-items: center;\n  min-height: var(--input-height);\n  width: 100%;\n  padding: 8px 10px;\n  background-color: var(--background-input);\n  border: var(--border-width) solid var(--border-normal);\n  border-radius: var(--border-radius);\n  justify-content: space-between;\n}\n.slug-display[data-v-bf2968ae] {\n  font-family: var(--family-monospace);\n  color: var(--foreground-normal);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  flex-grow: 1;\n  cursor: text;\n}\n.action-buttons[data-v-bf2968ae] {\n  display: flex;\n  gap: 8px;\n  margin-left: 8px;\n}\n.action-button[data-v-bf2968ae] {\n  color: var(--foreground-subdued);\n}\n.action-button[data-v-bf2968ae]:hover {\n  color: var(--foreground-normal);\n}\n.has-error[data-v-bf2968ae] {\n  border-color: var(--danger);\n}\n.valid-icon[data-v-bf2968ae] {\n  color: var(--success);\n}\n.invalid-icon[data-v-bf2968ae] {\n  color: var(--danger);\n}\n";
n(css,{});

var _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

var InterfaceComponent = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-bf2968ae"], ["__file", "interface.vue"]]);

var index = defineInterface({
  id: "slug-generator",
  name: "Slug Generator",
  icon: "link",
  description: "Generate and validate a slug from another field",
  component: InterfaceComponent,
  types: ["string"],
  group: "standard",
  options: [
    {
      field: "select_collection",
      name: "Source Collection",
      type: "string",
      meta: {
        width: "half",
        interface: "system-collection",
        options: {
          allowPrimaryKey: false,
          allowNone: false,
          includeCollections: ["translations"]
        }
      }
    },
    {
      field: "select_field",
      name: "Source Field",
      type: "string",
      meta: {
        width: "half",
        interface: "system-field",
        options: {
          collectionField: "select_collection",
          allowPrimaryKey: false,
          allowNone: false
        }
      }
    },
    {
      field: "auto",
      name: "Auto Generate",
      type: "boolean",
      meta: {
        width: "half",
        interface: "boolean",
        options: {
          label: "Generate slug automatically"
        }
      },
      schema: {
        default_value: true
      }
    },
    {
      field: "required",
      name: "Required",
      type: "boolean",
      meta: {
        width: "half",
        interface: "boolean",
        options: {
          label: "Slug is required"
        }
      },
      schema: {
        default_value: true
      }
    },
    {
      field: "separator",
      name: "Separator",
      type: "string",
      meta: {
        width: "half",
        interface: "select-dropdown",
        options: {
          choices: [
            { text: "Hyphen (-)", value: "-" },
            { text: "Underscore (_)", value: "_" }
          ]
        }
      },
      schema: {
        default_value: "-"
      }
    },
    {
      field: "lowercase",
      name: "Lowercase",
      type: "boolean",
      meta: {
        width: "half",
        interface: "boolean",
        options: {
          label: "Convert to lowercase"
        }
      },
      schema: {
        default_value: true
      }
    },
    {
      field: "placeholder",
      name: "Placeholder",
      type: "string",
      meta: {
        width: "half",
        interface: "input",
        options: {
          placeholder: "Enter placeholder text..."
        }
      }
    },
    {
      field: "custom_empty_message",
      name: "Custom Empty Error Message",
      type: "string",
      meta: {
        width: "full",
        interface: "input",
        options: {
          placeholder: "Slug cannot be empty. Please enter a valid slug."
        }
      }
    },
    {
      field: "custom_format_message",
      name: "Custom Format Error Message",
      type: "string",
      meta: {
        width: "full",
        interface: "input",
        options: {
          placeholder: "Slug must contain only lowercase letters, numbers, hyphens, and forward slashes."
        }
      }
    },
    {
      field: "custom_unique_message",
      name: "Custom Uniqueness Error Message",
      type: "string",
      meta: {
        width: "full",
        interface: "input",
        options: {
          placeholder: "This slug is already in use. Please enter a unique slug."
        }
      }
    }
  ]
});

export { index as default };
