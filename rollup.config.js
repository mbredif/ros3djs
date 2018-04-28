const rollup = require('rollup');

// plugin that transpiles output into commonjs format
const commonjs = require('rollup-plugin-commonjs');
// plugin that shows output file info
const filesize = require('rollup-plugin-filesize');
/// plugin that resolves node module imports
const resolve = require('rollup-plugin-node-resolve');
// plugin that minifies and obfuscates code
const uglify = require('rollup-plugin-uglify');

const pkg = require('./package.json');
const input = 'src/index.js'

const browserGlobals = {
  roslib: 'ROSLIB',
}

const moduleGlobals = {
  roslib: 'ROSLIB',
}

const outputFiles = {
  commonModule: pkg.main,
  esModule: pkg.module,
  browserGlobal: './build/ros3d.js',
  browserGlobalMinified: './build/ros3d.min.js',
}

export default [
  // build main as a CommonJS module for compatibility
  {
    input,
    output: {
      name: 'ROS3D',
      file: outputFiles.commonModule,
      format: 'cjs',
      globals: {
        ...moduleGlobals,
      }
    },
    external: [
      ...Object.keys(moduleGlobals)
    ],
    plugins: [
      resolve({ browser: true }),
      commonjs({
        include: [
          'node_modules/**',
          'node_modules/roslib/**'
        ],
        namedExports: {
          'node_modules/roslib/src/RosLib.js': ['UrdfModel', 'Ros']
        }
      }),
      filesize(),
    ],
  },
  // build module as ES6 module for modern tooling
  {
    input,
    output: {
      name: 'ROS3D',
      file: outputFiles.esModule,
      format: 'es',
      globals: {
        ...moduleGlobals,
      }
    },
    external: [
      ...Object.keys(moduleGlobals)
    ],
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      filesize(),
    ],
  },
  // build browser as IIFE module for script tag inclusion, unminified
  // Usage:
  // <script src="../build/ros3d.js"></script>
  {
    input,
    output: {
      name: 'ROS3D',
      file: outputFiles.browserGlobal,
      format: 'iife',
      globals: {
        ...browserGlobals,
      },
    },
    external: [
      ...Object.keys(browserGlobals),
    ],
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      filesize(),
    ],
  },
  // build browser as IIFE module for script tag inclusion, minified
  // Usage:
  // <script src="../build/ros3d.min.js"></script>
  {
    input,
    output: {
      name: 'ROS3D',
      file: outputFiles.browserGlobalMinified,
      format: 'iife',
      globals: {
        ...browserGlobals,
      },
    },
    external: [
      ...Object.keys(browserGlobals),
    ],
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      filesize(),
      uglify(),
    ],
  },
]