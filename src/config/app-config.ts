import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Wonderbewbz",
  version: packageJson.version,
  copyright: `© ${currentYear}, Wonderbewbz.`,
  meta: {
    title: "Wonderbewbz - Operations App",
    description: "Wonderbewbz Operations App",
  },
};
