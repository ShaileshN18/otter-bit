import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { connectToDatabase } from "../lib/db";
import Project from "../models/Project";

const seedProjects = [
  {
    id: "trello-react-tribute",
    slug: "trello-react-tribute",
    title: "Trello Tribute (React Kanban Board)",
    description: "Build a Trello-like Kanban board in React with drag-and-drop cards, list management, and state handlers while all styling and layout CSS is pre-configured.",
    difficulty: "intermediate",
    category: "Frontend Development",
    language: "JavaScript",
    framework: "React",
    version: "1.0.0",
    tasks: [
      {
        id: "task-1",
        order: 1,
        title: "Render Board & Column Lists",
        description: "Pass initial board data from src/data/initialData.js into src/components/Board.js and map over lists to render src/components/List.js.",
        goal: "Understand component composition and passing state/props through Kanban columns.",
        targetFiles: ["src/components/Board.js", "src/data/initialData.js"],
        evaluationCriteria: [
          "Export functional Board component",
          "Map over lists array to render List components"
        ],
        status: "not-started"
      },
      {
        id: "task-2",
        order: 2,
        title: "Add New Cards to Column Lists",
        description: "Implement input state and handleAddCard submit handler in src/components/List.js to append new cards to the list.",
        goal: "Master local form state and updating nested array data structures in React state.",
        targetFiles: ["src/components/List.js", "src/components/Card.js"],
        evaluationCriteria: [
          "Manage input text state for new card title",
          "Append new card to list state on form submit"
        ],
        status: "not-started"
      },
      {
        id: "task-3",
        order: 3,
        title: "Add New Columns to Board",
        description: "Implement handleAddList state handler in src/components/Board.js to allow users to create new board columns dynamically.",
        goal: "Manage board-level state and dynamically add new list containers.",
        targetFiles: ["src/components/Board.js"],
        evaluationCriteria: [
          "Add new list object with unique ID to board state",
          "Clear input field after column creation"
        ],
        status: "not-started"
      }
    ],
    files: [
      {
        path: "src/index.js",
        content: `import { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './styles.css';\n\nconst container = document.getElementById('root');\nif (container) {\n  const root = createRoot(container);\n  root.render(<App />);\n}\n`,
        type: "javascriptreact",
        visible: true,
        editable: true,
        description: "React DOM entrypoint"
      },
      {
        path: "src/App.js",
        content: `import Board from './components/Board';\n\nexport default function App() {\n  return (\n    <div className="app-container">\n      <header className="header-navbar">\n        <h1 className="header-title">📋 Trello Tribute Workspace</h1>\n        <span style={{ fontSize: "12px", opacity: 0.8 }}>React & Phoenix Tribute</span>\n      </header>\n      <Board />\n    </div>\n  );\n}\n`,
        type: "javascriptreact",
        visible: true,
        editable: true,
        description: "Main Application component"
      },
      {
        path: "src/components/Board.js",
        content: `import { useState } from 'react';\nimport List from './List';\nimport { initialBoardData } from '../data/initialData';\n\nexport default function Board() {\n  const [board, setBoard] = useState(initialBoardData);\n  const [newListTitle, setNewListTitle] = useState('');\n\n  function handleAddCard(listId, cardTitle) {\n    setBoard((prev) => ({\n      ...prev,\n      lists: prev.lists.map((list) => {\n        if (list.id === listId) {\n          return {\n            ...list,\n            cards: [\n              ...list.cards,\n              { id: \`card-\${Date.now()}\`, title: cardTitle }\n            ]\n          };\n        }\n        return list;\n      })\n    }));\n  }\n\n  function handleAddList(e) {\n    e.preventDefault();\n    if (!newListTitle.trim()) return;\n\n    const newList = {\n      id: \`list-\${Date.now()}\`,\n      title: newListTitle.trim(),\n      cards: []\n    };\n\n    setBoard((prev) => ({\n      ...prev,\n      lists: [...prev.lists, newList]\n    }));\n\n    setNewListTitle('');\n  }\n\n  return (\n    <div className="board-container">\n      {board.lists.map((list) => (\n        <List key={list.id} list={list} onAddCard={handleAddCard} />\n      ))}\n\n      <form onSubmit={handleAddList} className="add-list-form" style={{ background: 'rgba(255,255,255,0.24)', padding: '8px', borderRadius: '8px', width: '272px', flexShrink: 0 }}>\n        <input\n          type="text"\n          className="add-list-input"\n          placeholder="+ Add another list"\n          value={newListTitle}\n          onChange={(e) => setNewListTitle(e.target.value)}\n        />\n        <button type="submit" className="btn-primary" style={{ width: '100%' }}>\n          Add List\n        </button>\n      </form>\n    </div>\n  );\n}\n`,
        type: "javascriptreact",
        visible: true,
        editable: true,
        targetTasks: ["task-1", "task-3"],
        description: "Kanban Board container rendering lists and handleAddList"
      },
      {
        path: "src/components/List.js",
        content: `import { useState } from 'react';\nimport Card from './Card';\n\nexport default function List({ list, onAddCard }) {\n  const [newCardTitle, setNewCardTitle] = useState('');\n  const [isAdding, setIsAdding] = useState(false);\n\n  function handleSubmit(e) {\n    e.preventDefault();\n    if (!newCardTitle.trim()) return;\n    onAddCard(list.id, newCardTitle.trim());\n    setNewCardTitle('');\n    setIsAdding(false);\n  }\n\n  return (\n    <div className="list-wrapper">\n      <div className="list-header">\n        <h3>{list.title}</h3>\n        <span className="card-count">{list.cards.length}</span>\n      </div>\n\n      <div className="cards-container">\n        {list.cards.map((card) => (\n          <Card key={card.id} card={card} />\n        ))}\n      </div>\n\n      {isAdding ? (\n        <form onSubmit={handleSubmit} className="add-card-form">\n          <input\n            type="text"\n            autoFocus\n            className="add-card-input"\n            placeholder="Enter card title..."\n            value={newCardTitle}\n            onChange={(e) => setNewCardTitle(e.target.value)}\n          />\n          <div style={{ display: 'flex', gap: '6px' }}>\n            <button type="submit" className="btn-primary">Add Card</button>\n            <button\n              type="button"\n              onClick={() => setIsAdding(false)}\n              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#5e6c84' }}\n            >\n              ✕\n            </button>\n          </div>\n        </form>\n      ) : (\n        <button\n          type="button"\n          onClick={() => setIsAdding(true)}\n          style={{\n            padding: '8px 12px',\n            background: 'none',\n            border: 'none',\n            textAlign: 'left',\n            color: '#5e6c84',\n            cursor: 'pointer',\n            fontSize: '13px'\n          }}\n        >\n          + Add a card\n        </button>\n      )}\n    </div>\n  );\n}\n`,
        type: "javascriptreact",
        visible: true,
        editable: true,
        targetTasks: ["task-2"],
        description: "Column list component"
      },
      {
        path: "src/components/Card.js",
        content: `export default function Card({ card }) {\n  return (\n    <div className="card-item">\n      {card.title}\n    </div>\n  );\n}\n`,
        type: "javascriptreact",
        visible: true,
        editable: true,
        targetTasks: ["task-2"],
        description: "Individual Kanban card item component"
      },
      {
        path: "src/data/initialData.js",
        content: `export const initialBoardData = {\n  title: "Development Sprint Board",\n  lists: [\n    {\n      id: "list-1",\n      title: "To Do",\n      cards: [\n        { id: "card-1", title: "Set up Phoenix backend channel connection" },\n        { id: "card-2", title: "Implement React state management for cards" }\n      ]\n    },\n    {\n      id: "list-2",\n      title: "In Progress",\n      cards: [\n        { id: "card-3", title: "Design Trello Tribute CSS column components" }\n      ]\n    },\n    {\n      id: "list-3",\n      title: "Completed",\n      cards: [\n        { id: "card-4", title: "Project workspace environment setup" }\n      ]\n    }\n  ]\n};\n`,
        type: "javascript",
        visible: true,
        editable: true,
        targetTasks: ["task-1"],
        description: "Initial data structure for Kanban board"
      },
      {
        path: "src/styles.css",
        content: `/* Pre-configured Trello Tribute CSS */\n* {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\nbody {\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\n  background-color: #0079bf;\n  color: #172b4d;\n  height: 100vh;\n  overflow: hidden;\n}\n\n.app-container {\n  display: flex;\n  flex-direction: column;\n  height: 100vh;\n  background: linear-gradient(135deg, #0079bf 0%, #51e5ff 100%);\n}\n\n.header-navbar {\n  background: rgba(0, 0, 0, 0.2);\n  backdrop-filter: blur(4px);\n  padding: 10px 16px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  color: #ffffff;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.15);\n}\n\n.header-title {\n  font-size: 16px;\n  font-weight: 700;\n  letter-spacing: 0.5px;\n}\n\n.board-container {\n  flex: 1;\n  display: flex;\n  align-items: flex-start;\n  gap: 12px;\n  padding: 16px;\n  overflow-x: auto;\n}\n\n.list-wrapper {\n  background: #ebecf0;\n  border-radius: 8px;\n  width: 272px;\n  max-height: 100%;\n  display: flex;\n  flex-direction: column;\n  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);\n  flex-shrink: 0;\n}\n\n.list-header {\n  padding: 10px 12px;\n  font-weight: 600;\n  font-size: 14px;\n  color: #172b4d;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.card-count {\n  font-size: 11px;\n  background: rgba(9, 30, 66, 0.08);\n  padding: 2px 6px;\n  border-radius: 10px;\n}\n\n.cards-container {\n  padding: 0 8px 8px 8px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  overflow-y: auto;\n}\n\n.card-item {\n  background: #ffffff;\n  border-radius: 4px;\n  padding: 10px 12px;\n  font-size: 13px;\n  line-height: 1.4;\n  color: #172b4d;\n  box-shadow: 0 1px 0 rgba(9,30,66,.25);\n  cursor: pointer;\n  transition: background 0.15s ease;\n}\n\n.card-item:hover {\n  background: #f4f5f7;\n}\n\n.add-card-form, .add-list-form {\n  padding: 8px;\n}\n\n.add-card-input, .add-list-input {\n  width: 100%;\n  padding: 8px;\n  border: 2px solid #0079bf;\n  border-radius: 4px;\n  font-size: 13px;\n  outline: none;\n  margin-bottom: 8px;\n}\n\n.btn-primary {\n  background: #0079bf;\n  color: #fff;\n  border: none;\n  padding: 6px 12px;\n  border-radius: 4px;\n  font-size: 13px;\n  font-weight: 600;\n  cursor: pointer;\n}\n\n.btn-primary:hover {\n  background: #026aa7;\n}\n`,
        type: "css",
        visible: true,
        editable: false,
        description: "Pre-configured CSS styling for Trello Tribute layout"
      },
      {
        path: "package.json",
        content: JSON.stringify(
          {
            name: "trello-react-tribute",
            version: "1.0.0",
            dependencies: { react: "^18.2.0", "react-dom": "^18.2.0" }
          },
          null,
          2
        ),
        type: "json",
        visible: false,
        editable: false,
        description: "Hidden package.json"
      },
      {
        path: "public/index.html",
        content: "<!DOCTYPE html><html><head><title>Trello Tribute</title></head><body><div id='root'></div></body></html>",
        type: "html",
        visible: false,
        editable: false,
        description: "Hidden index.html"
      }
    ]
  },
  {
    id: "advanced-express-backend",
    slug: "advanced-express-backend",
    title: "Advanced Express Backend",
    description: "Learn modular Express architecture, custom routing, and controller validation.",
    difficulty: "advanced",
    category: "Backend Development",
    language: "JavaScript",
    framework: "Express",
    version: "1.0.0",
    tasks: [
      {
        id: "task-1",
        order: 1,
        title: "Set up Express API Routes",
        description: "Define modular API routes for authentication and system health checks in src/routes/api.js.",
        goal: "Master Express Router creation, route parameters, and modular endpoint organization.",
        targetFiles: ["src/routes/api.js"],
        evaluationCriteria: [
          "Export an instance of express.Router()",
          "Implement GET /health endpoint returning { status: 'ok' }",
          "Implement POST /auth/login route delegating to controller"
        ],
        status: "not-started"
      },
      {
        id: "task-2",
        order: 2,
        title: "Implement User Controller Logic",
        description: "Complete user query, data sanitization, and request validation in src/controllers/userController.js.",
        goal: "Understand request validation, controller error handling, and HTTP status code discipline.",
        targetFiles: ["src/controllers/userController.js"],
        evaluationCriteria: [
          "Validate required email and password fields",
          "Return 400 Bad Request when validation fails",
          "Return 200 OK with sanitized user profile object on success"
        ],
        status: "not-started"
      }
    ],
    files: [
      {
        path: "src/server.js",
        content: `const express = require('express');\nconst apiRouter = require('./routes/api');\n\nconst app = express();\napp.use(express.json());\napp.use('/api', apiRouter);\n\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => {\n  console.log(\`Express server running on port \${PORT}\`);\n});\n`,
        type: "javascript",
        visible: true,
        editable: true,
        description: "Main Express application server entrypoint"
      },
      {
        path: "src/routes/api.js",
        content: `const express = require('express');\nconst { handleLogin } = require('../controllers/userController');\nconst router = express.Router();\n\n// TODO: Task 1 - Add GET /health endpoint\n\n// TODO: Task 1 - Add POST /auth/login endpoint\n\nmodule.exports = router;\n`,
        type: "javascript",
        visible: true,
        editable: true,
        targetTasks: ["task-1"],
        description: "Express API routes definitions"
      },
      {
        path: "src/controllers/userController.js",
        content: `function handleLogin(req, res) {\n  const { email, password } = req.body;\n  // TODO: Task 2 - Validate input and handle login response\n  res.json({ message: 'Controller pending implementation' });\n}\n\nmodule.exports = { handleLogin };\n`,
        type: "javascript",
        visible: true,
        editable: true,
        targetTasks: ["task-2"],
        description: "User authentication & profile controller"
      },
      {
        path: "package.json",
        content: JSON.stringify(
          {
            name: "express-backend-starter",
            version: "1.0.0",
            main: "src/server.js",
            scripts: { start: "node src/server.js" },
            dependencies: { express: "^4.18.2" }
          },
          null,
          2
        ),
        type: "json",
        visible: false,
        editable: false,
        description: "Hidden dependency configuration mounted into WebContainer"
      },
      {
        path: ".env",
        content: "PORT=3000\nJWT_SECRET=super-secret-key-123\n",
        type: "env",
        visible: false,
        editable: false,
        description: "Hidden environment variables file"
      },
      {
        path: "frontend/index.html",
        content: "<!DOCTYPE html><html><head><title>Backend Test Client</title></head><body><div id='root'></div></body></html>",
        type: "html",
        visible: false,
        editable: false,
        description: "Hidden frontend client provided for testing backend APIs"
      },
      {
        path: "frontend/src/App.jsx",
        content: "export default function App() { return <h1>Backend Test Client</h1>; }",
        type: "javascriptreact",
        visible: false,
        editable: false,
        description: "Hidden frontend client component"
      },
      {
        path: "frontend/src/main.jsx",
        content: "console.log('Frontend initialized');",
        type: "javascriptreact",
        visible: false,
        editable: false,
        description: "Hidden frontend entry"
      },
      {
        path: "frontend/src/styles.css",
        content: "body { font-family: sans-serif; }",
        type: "css",
        visible: false,
        editable: false,
        description: "Hidden frontend styles"
      }
    ]
  },
  {
    id: "react-sandbox",
    slug: "react-sandbox",
    title: "React Component Sandbox",
    description: "Learn stateful component development and React hooks.",
    difficulty: "intermediate",
    category: "Frontend Development",
    language: "TypeScript",
    framework: "React",
    version: "1.0.0",
    tasks: [
      {
        id: "task-1",
        order: 1,
        title: "Build Counter Component",
        description: "Implement a stateful Counter component with increment and decrement buttons in src/components/Counter.tsx.",
        goal: "Master React useState hook and user event handling.",
        targetFiles: ["src/components/Counter.tsx"],
        evaluationCriteria: [
          "Use useState hook to maintain counter value",
          "Provide increment button (+)",
          "Provide decrement button (-)"
        ],
        status: "not-started"
      }
    ],
    files: [
      {
        path: "src/App.tsx",
        content: `import Counter from './components/Counter';\n\nexport default function App() {\n  return (\n    <div>\n      <h1>React Sandbox</h1>\n      <Counter />\n    </div>\n  );\n}\n`,
        type: "typescriptreact",
        visible: true,
        editable: true,
        description: "Main App component"
      },
      {
        path: "src/components/Counter.tsx",
        content: `import { useState } from 'react';\n\nexport default function Counter() {\n  // TODO: Task 1 - Add state and counter handlers\n  return <div>Counter Component</div>;\n}\n`,
        type: "typescriptreact",
        visible: true,
        editable: true,
        targetTasks: ["task-1"],
        description: "Interactive Counter component"
      },
      {
        path: "package.json",
        content: JSON.stringify(
          {
            name: "react-sandbox",
            version: "1.0.0",
            scripts: { start: "react-scripts start" },
            dependencies: { react: "^18.2.0", "react-dom": "^18.2.0" }
          },
          null,
          2
        ),
        type: "json",
        visible: false,
        editable: false,
        description: "Hidden React project package configuration"
      }
    ]
  }
];

async function seed() {
  console.log("Connecting to MongoDB...");
  await connectToDatabase();

  console.log("Seeding project database...");
  for (const projData of seedProjects) {
    const res = await Project.findOneAndUpdate(
      { id: projData.id },
      projData,
      { upsert: true, returnDocument: "after", runValidators: true }
    );
    console.log(`Successfully seeded project: "${res.title}" (ID: ${res.id})`);
  }

  console.log("Database seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
