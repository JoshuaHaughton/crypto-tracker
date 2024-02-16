const StyleDictionary = require("style-dictionary");

// Function to format the output by categories
function formatByCategory(allProperties) {
  let categories = {};

  // Grouping properties by category
  allProperties.forEach((prop) => {
    const category = prop.attributes.category;
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(prop);
  });

  // Formatting each category
  let output = "";
  for (const category in categories) {
    output += `// ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
    categories[category].forEach((prop) => {
      output += `  --${prop.name}: ${prop.value};\n`;
      if (prop.darkValue) {
        output += `  --${prop.name}-dark: ${prop.darkValue};\n`;
      }
    });
    output += `\n`; // Add a newline for spacing between categories
  }

  return output;
}

// Register a custom format
StyleDictionary.registerFormat({
  name: "custom/css/variables",
  formatter: function ({ dictionary, options }) {
    let output = `:root {\n`;
    output += formatByCategory(dictionary.allProperties);
    output += `}\n`;
    return output;
  },
});

module.exports = {
  source: ["src/styles/tokens/*.tokens.json"],
  platforms: {
    scss: {
      transformGroup: "scss",
      buildPath: "src/styles/partials/",
      files: [
        {
          destination: "_variables.scss",
          format: "custom/css/variables",
        },
      ],
    },
  },
};
