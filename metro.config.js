const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

// Añade las extensiones que usas
defaultConfig.resolver.sourceExts.push("cjs");

// Esta línea es la que puede evitar el error de 'Component auth has not been registered yet'
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
