# Slug Generator

A custom Directus interface for generating and validating URL slugs from other fields.

## Features

- Generate slugs automatically from a source field
- Select a source field from the current collection directly in the interface
- Support for selecting fields from the current collection or related collections
- Live validation of slug format
- Option to regenerate slugs on demand
- Configurable separator (hyphen or underscore)
- Option to force lowercase

## Installation

1. Clone this repository or download the extension files
2. Place them in your Directus extensions folder
3. Build the extension using `npm run build`
4. Restart your Directus instance

## Usage

1. Create a field with type `string` to store the slug
2. Choose `Slug Generator` as the interface
3. Configure the options:
   - **Source Field**: Choose the field that will be the source for the slug (or leave empty to select at runtime)
   - **Auto Generate**: Enable/disable automatic slug generation as you type
   - **Separator**: Choose between hyphen (-) or underscore (_)
   - **Lowercase**: Enable/disable forcing slugs to lowercase
   - **Placeholder**: Custom placeholder text for the input field

When no source field is configured in the options, the interface will display a dropdown to select a source field from the current collection.

## Examples

### Simple slug from a title field

```json
{
  "source": "title",
  "auto": true,
  "separator": "-",
  "lowercase": true
}
```

### Dynamic source field selection

```json
{
  "source": "",
  "auto": true,
  "separator": "-",
  "lowercase": true
}
```

### Slug from a translated field

```json
{
  "source": "translations.title",
  "auto": true,
  "separator": "-",
  "lowercase": true
}
```

## Validation Rules

The slug validation follows these rules:
- Can only contain lowercase alphanumeric characters and the separator
- Cannot start or end with the separator
- Cannot contain consecutive separators

## License

This extension is licensed under the MIT license.
