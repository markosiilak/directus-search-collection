# Directus Search Collection Item Extension

A Directus extension that provides an advanced search interface for linking items from collections.

## Features

- Search for items by name or event ID
- Dropdown selector to switch between search types
- Auto-suggestions based on search input
- Automatically adds selected items to the collection
- Updates current item with relevant data from the selected item
- User-friendly interface with custom styled dropdown

## Usage

This extension allows users to search for and select items from a specified collection. It's particularly useful for creating relationships between collections.

### Configuration Options

When configuring the interface in Directus, the following options are available:

- **value**: The current value to display in the search field
- **placeholder**: Custom placeholder text for the search input (default: "Search for an event")
- **collection**: The collection that contains the current item being edited
- **fieldCollection**: The collection to search in (default: "event")

### Example

The extension is designed to work with event data. When a user selects an event from the search results, it will:

1. Update the current item with the event's title
2. Set the URL based on the event's category and slug
3. Include the event's image

## Development

This extension is built using Vue 3 and the Directus Extensions SDK.

### Key Components

- Custom dropdown selector for search type
- Auto-complete search functionality
- Live filtering of results
- Directus API integration for data fetching and updating

### File Structure

- `interface.vue`: Main component file containing all functionality
- `index.js`: Entry point for the extension

## Requirements

- Directus 9.0.0+
- Collections with proper schema for events and related items
