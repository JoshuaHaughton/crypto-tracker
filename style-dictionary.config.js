const StyleDictionary = require("style-dictionary");

// Function to format the output by categories and handle specific properties
function formatByCategory(allProperties, isScss = false) {
  let categories = {};
  const prefix = isScss ? "$" : "--"; // Set prefix based on SCSS or CSS

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

  const categoryKeys = Object.keys(categories);
  categoryKeys.forEach((category, index) => {
    output += `\n// ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;

    categories[category].forEach((prop) => {
      output += `  ${prefix}${prop.name}: ${prop.value};\n`;
      if (prop.darkValue) {
        output += `  ${prefix}${prop.name}-dark: ${prop.darkValue};\n`;
      }
      if (prop.weight) {
        const weightPropertyName = prop.name.includes("sizes")
          ? prop.name.replace("sizes", "weight")
          : `${prop.name}-weight`;
        output += `  ${prefix}${weightPropertyName}: ${prop.weight};\n`;
      }
      if (prop.lineHeight) {
        const lineHeightPropertyName = prop.name.includes("sizes")
          ? prop.name.replace("sizes", "lineHeight")
          : `${prop.name}-lineHeight`;
        output += `  ${prefix}${lineHeightPropertyName}: ${prop.lineHeight};\n`;
      }
    });
    // Add a newline for spacing between categories only if it's not the last category
    if (index < categoryKeys.length - 1) {
      output += `\n`;
    }
  });

  return output.trim();
}

// Register custom formats
StyleDictionary.registerFormat({
  name: "custom/css/variables",
  formatter: function ({ dictionary }) {
    return `:root {\n${formatByCategory(dictionary.allProperties)}\n}`;
  },
});

StyleDictionary.registerFormat({
  name: "custom/scss/variables",
  formatter: function ({ dictionary }) {
    return formatByCategory(dictionary.allProperties, true);
  },
});

const isColorToken = (prop) => prop.attributes.category === "colors";
const isNotColorToken = (prop) => prop.attributes.category !== "colors";

module.exports = {
  source: ["src/styles/tokens/*.tokens.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "src/styles/partials/",
      files: [
        {
          destination: "_generatedCssVars.scss",
          format: "custom/css/variables",
          filter: isNotColorToken,
        },
      ],
    },
    scss: {
      transformGroup: "scss",
      buildPath: "src/styles/partials/",
      files: [
        {
          destination: "_generatedScssVars.scss",
          format: "custom/scss/variables",
          filter: isColorToken,
        },
      ],
    },
  },
};
