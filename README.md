# Instead Frontend - Technical Test Submission

This is the frontend implementation for the Instead Technical Test. It demonstrates how to consume the Annotation Specification and render interactive tax forms.

## Table of Contents
- [Overview](#overview)
- [How It Works](#how-it-works)
- [Installation](#installation)
- [Running Locally](#running-locally)

## Overview
The frontend application fetches the **Form Template** (the background PDF/image) and the **Annotation Specification** (the JSON structure defining fields) from the backend. It then overlays interactive input fields or static text onto the form based on the `x`, `y`, `width`, and `height` properties defined in the spec.

## How It Works
1. **Fetching Data:** The app queries the backend (e.g., `/api/forms/1040`) to get the list of annotations.
2. **Rendering:**
   - It iterates through the text/input fields.
   - It positions them absolutely on top of the form image.
   - It applies styles from the `format` object (font size, alignment).
3. **Data Binding:**
   - When a user types in a field, the app updates the underlying data model.
   - If a `data_binding` path like `$.taxpayer.first_name` is present, the app knows exactly where to store that value in the global state.

## Installation
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Running Locally
1. Ensure the **backend** is running on port 3000.
2. Start the frontend dev server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

## Tech Stack
- **React**: UI Library
- **TypeScript**: Type safety (matching the Backend definitions)
- **Vite**: Build tool
