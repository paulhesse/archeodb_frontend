import React from 'react';

const ProjectInfo: React.FC = () => {
  return (
    <div className="p-4 h-full overflow-auto">
      <h2 className="text-xl font-semibold mb-4">Project Information</h2>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-3">ArchaeoGraph Exhibition Project</h3>

        <div className="prose prose-slate max-w-none">
          <p className="mb-4">
            This is a placeholder for our project description for the exhibition. Below is a mockup
            of what our project information section will contain.
          </p>

          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2">Project Overview</h4>
            <p className="text-sm text-slate-700">
              ArchaeoGraph is a knowledge graph explorer for CIDOC CRM data, designed to help
              archaeologists and researchers visualize and analyze complex relationships in
              archaeological datasets.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2">Key Features</h4>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              <li>Interactive graph visualization of CIDOC CRM relationships</li>
              <li>Advanced query interface for exploring archaeological data</li>
              <li>Data ingestion capabilities for expanding the knowledge graph</li>
              <li>Node detail panels for in-depth examination of entities</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2">Technical Implementation</h4>
            <p className="text-sm text-slate-700">
              Built with React, TypeScript, and ArangoDB, featuring a responsive design
              and modern UI components.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium mb-2">Exhibition Details</h4>
            <p className="text-sm text-slate-700">
              This project will be showcased at the upcoming exhibition, demonstrating
              how knowledge graphs can revolutionize archaeological research and data analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;