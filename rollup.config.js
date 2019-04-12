// rollup.config.js
import typescript from 'rollup-plugin-typescript'

export default {
    input: 'src/index.ts',
    plugins: [typescript()],
    output: [
        {
            file: 'index.cjs.js',
            format: 'cjs'
        },
        {
            file: 'index.es.js',
            format: 'es'
        }
    ]
}
