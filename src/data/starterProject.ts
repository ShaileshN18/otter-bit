export const starterProject = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          name: "starter-app",
          scripts: { start: "node index.js" },
          dependencies: {}
        },
        null,
        2
      )
    }
  },
  "index.js": {
    file: {
      contents: `console.log("Hello from WebContainer!");\nconst { add } = require("./src/utils/math");\nconsole.log("2 + 3 =", add(2, 3));\n`
    }
  },
  src: {
    directory: {
      "app.js": {
        file: {
          contents: `console.log("App module initialized");\n`
        }
      },
      utils: {
        directory: {
          "math.js": {
            file: {
              contents: `function add(a, b) {\n  return a + b;\n}\n\nmodule.exports = { add };\n`
            }
          }
        }
      }
    }
  },
  public: {
    directory: {
      "styles.css": {
        file: {
          contents: `/* Main styles */\nbody {\n  font-family: system-ui, sans-serif;\n  background: #111;\n  color: #eee;\n}\n`
        }
      }
    }
  }
};
