# ArchaeoGraph Frontend

A modern, interactive frontend for the ArchaeoGraph knowledge graph system built on CIDOC CRM standards.

## Project Overview

ArchaeoGraph Frontend provides a user-friendly interface for querying and visualizing archaeological data stored in ArangoDB using the CIDOC CRM ontology.

## Features

- **Interactive Graph Visualization**: Visualize CIDOC CRM entities and relationships using Vis.js
- **AQL Query Interface**: Execute ArangoDB queries directly from the UI
- **Node Exploration**: Click on nodes to see detailed information
- **Responsive Design**: Clean, modern UI with Tailwind CSS
- **Error Handling**: Graceful error handling and user feedback

## Technology Stack

- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Graph Visualization**: Vis.js
- **API Integration**: Fetch API with proper error handling

## Project Structure

```
archeograph-frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── GraphVisualization.tsx  # Vis.js graph component
│   │   └── QueryInterface.tsx     # Query form component
│   ├── services/            # API services
│   │   └── arangoService.ts       # ArangoDB API service
│   ├── App.tsx              # Main application component
│   ├── index.css            # Global styles with Tailwind
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── tailwind.config.js       # Tailwind configuration
├── test-frontend.html       # Standalone test page
└── package.json            # Project dependencies
```

## Setup and Installation

### Prerequisites

- Node.js 20.19+ or 22.12+ (required for Vite)
- npm or yarn
- Access to your ArangoDB/n8n backend API

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/paulhesse/archeodb_frontend.git
   cd archeodb_frontend/archeograph-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration

### API Endpoint

The frontend is configured to use your n8n webhook endpoint:
```
https://n8n_v2.paulserver.dpdns.org/webhook-test/api/query_arango
```

To change the API endpoint, modify the `baseUrl` parameter in `src/services/arangoService.ts`.

### Tailwind CSS

The project uses Tailwind CSS for styling. Configuration can be found in `tailwind.config.js`.

## Usage

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:5173`

### Using the Test Page

For quick testing without Node.js compatibility issues, you can use the standalone test page:

```bash
open archeograph-frontend/test-frontend.html
```

**The test page now includes full functionality:**

- ✅ **Real API Calls**: Connects to your n8n endpoint (`https://n8n_v2.paulserver.dpdns.org/webhook-test/api/query_arango`)
- ✅ **Interactive Graph Visualization**: Uses Vis.js to display nodes and edges
- ✅ **Node Details**: Click on nodes to see detailed information
- ✅ **CIDOC CRM Coloring**: Nodes are colored by their entity type
- ✅ **Error Handling**: Proper error handling with user feedback
- ✅ **Loading States**: Visual feedback during API calls

### Query Examples

The test page includes example queries that work with your CIDOC CRM data:

1. **Basic Traversal**:
   ```aql
   FOR v, e, p IN 1..2 ANY "root" GRAPH "cidoc_graph" RETURN {nodes: [v], edges: [e]}
   ```

2. **All Nodes**:
   ```aql
   FOR node IN cidoc_graph RETURN node
   ```

3. **Outbound Relationships**:
   ```aql
   FOR v, e IN 1..1 OUTBOUND "E22_Artifact_001" GRAPH "cidoc_graph" RETURN {v, e}
   ```

### Expected Response Format

The frontend expects your API to return data in this format:

```json
{
  "nodes": [
    {
      "id": "node_id",
      "label": "Node Label",
      "type": "E22_HumanMadeObject",
      "properties": {
        "property1": "value1",
        "property2": "value2"
      }
    }
  ],
  "edges": [
    {
      "from": "source_node_id",
      "to": "target_node_id",
      "label": "relationship_type",
      "properties": {
        "property1": "value1"
      }
    }
  ]
}
```

### CIDOC CRM Entity Types Supported

The visualization automatically colors nodes based on these CIDOC CRM types:

- **E22_HumanMadeObject** (Artifacts): Purple (#4f46e5)
- **E53_Place** (Places): Green (#10b981)
- **E39_Actor** (People/Actors): Orange (#f59e0b)
- **E65_Creation** (Events): Red (#ef4444)
- **E31_Document** (Documents): Purple (#8b5cf6)
- **E18_PhysicalThing**: Blue (#3b82f6)
- **E5_Event**: Pink (#ec4899)
- **E55_Type**: Green (#84cc16)
- **E42_Identifier**: Orange (#f97316)
- **E73_InformationObject**: Indigo (#6366f1)
- **E9_Move**: Cyan (#06b6d4)
- **Default**: Gray (#6b7280)

### Query Examples

The interface includes several example queries:

1. **Basic Traversal**:
   ```aql
   FOR v, e, p IN 1..2 ANY "root" GRAPH "cidoc_graph" RETURN {nodes: [v], edges: [e]}
   ```

2. **All Nodes**:
   ```aql
   FOR node IN cidoc_graph RETURN node
   ```

3. **Outbound Relationships**:
   ```aql
   FOR v, e IN 1..1 OUTBOUND "E22_Artifact_001" GRAPH "cidoc_graph" RETURN {v, e}
   ```

## Development

### Adding New Features

1. **New Components**: Add React components in the `src/components/` directory
2. **New Services**: Add API services in the `src/services/` directory
3. **New Styles**: Add custom styles to `src/index.css`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## CIDOC CRM Entity Types

The visualization automatically colors nodes based on their CIDOC CRM type:

- **E22_HumanMadeObject** (Artifacts): Purple (#4f46e5)
- **E53_Place** (Places): Green (#10b981)
- **E39_Actor** (People/Actors): Orange (#f59e0b)
- **E65_Creation** (Events): Red (#ef4444)
- **E31_Document** (Documents): Purple (#8b5cf6)
- **Default**: Gray (#6b7280)

## Error Handling

The application includes comprehensive error handling:

- Network errors
- API response errors
- Query validation
- User feedback with error messages

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License

## Support

For issues or questions, please contact the project maintainer.

## Future Enhancements

- Advanced query builder with visual interface
- Graph export functionality (JSON, RDF)
- Collaboration features
- Authentication and user management
- Query history and favorites
- Performance optimization for large graphs