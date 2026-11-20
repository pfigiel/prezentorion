import { createPostcssConfig } from '@prezentorion/postcss-config'

export default createPostcssConfig({
  mixinsFiles: [new URL('src/ui/mixins.css', import.meta.url).pathname],
})
