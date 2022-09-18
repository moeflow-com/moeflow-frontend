/**
 * 用于从字体文件中切割需要的部分
 */
const Fontmin = require('fontmin');
function clip({ text, fontSrc }) {
  const fontmin = new Fontmin()
    .src(fontSrc)
    .use(
      Fontmin.glyph({
        text
      })
    )
    .dest(fontDest);
  fontmin.run(function(err, files, stream) {
    if (err) {
      console.error(err);
    }
    console.log('成功');
  });
}

const fontDest = 'src/fonts/clipped'; // 输出路径
const fontSrc = 'src/fonts/ABeeZee-Regular.ttf'; // 源文件
const text = '1234567890'; // 需要切出的文本
clip({ text, fontSrc, fontDest });
