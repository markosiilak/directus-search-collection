# Directus Slug Generator

A custom Directus interface for generating and validating URL slugs from other fields.

## Features

- Generate slugs automatically from a source field
- Interactive editing mode with validation
- Support for hierarchical paths with slashes
- Select source fields from the current collection or related collections
- Unique slug validation within the collection
- Real-time validation with feedback
- Option to manually edit or regenerate slugs
- Configurable separator (default is hyphen)
- Option to force lowercase
- Custom validation messages
- Support for translation collections

## Installation

1. Clone this repository or download the extension files
2. Place them in your Directus extensions folder
3. Build the extension using `npm run build`
4. Restart your Directus instance

## Usage

1. Create a field with type `string` to store the slug
2. Choose `Slug Generator` as the interface
3. Configure the options:
   - **Collection**: (Auto-populated) The collection where this field exists
   - **Field**: (Auto-populated) The field name this interface is applied to
   - **Source Field Selection**: Choose the field that will be the source for generating the slug
   - **Auto Generate**: Enable/disable automatic slug generation
   - **Required**: Whether an empty slug should be considered invalid
   - **Separator**: Character used as word separator (default: hyphen)
   - **Lowercase**: Enable/disable forcing slugs to lowercase
   - **Placeholder**: Custom placeholder text for the input field
   - **Custom Empty Message**: Custom validation message for empty slugs
   - **Custom Format Message**: Custom validation message for improperly formatted slugs
   - **Custom Unique Message**: Custom validation message for non-unique slugs

## Path Features

The slug generator supports hierarchical paths:
- Paths can include forward slashes (e.g., `parent/child/page`)
- Leading slashes are preserved (e.g., `/absolute/path`)
- Trailing slashes are preserved (e.g., `category/`)

## Validation Rules

The slug validation follows these rules:
- Can contain lowercase alphanumeric characters, hyphens, and slashes
- Cannot contain spaces or special characters
- Cannot contain consecutive separators
- Must be unique within the collection (with special handling for translation collections)

## License

This extension is licensed under the MIT license.
