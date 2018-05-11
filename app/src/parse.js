import wtf from 'wtf_wikipedia'

const parse = (title, lang = 'en') => {
  return wtf.fetch(title, lang).then((doc) => {
      const description = doc.sections()[0] && doc.sections()[0].data.sentences.map(sentence => sentence.text).join(' ')
      const img = doc.images(0)
      const image = img && img.src()
      return {
        description,
        title,
        image
      }
    })
    .catch(console.error)
}

export default parse
