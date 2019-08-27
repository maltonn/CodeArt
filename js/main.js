
const code = document.getElementById('code')
const textarea = document.getElementById('textarea1')
const img_file = document.getElementById('img_file')
const preview = document.getElementById("preview")
code.addEventListener('change', function(e) {
  var result = e.target.files[0];
  var reader = new FileReader();
  reader.readAsText(result);
  reader.addEventListener('load', function() {
    txt = reader.result
    isHalf = GetIsHalf(txt)
    Sub1(txt, isHalf)
  })
})

textarea.addEventListener('keydown', function(e) {
  txt = this.value
  if (e.key != "Enter" || !txt) {
    return false
  }
  isHalf = GetIsHalf(txt)
  Sub1(txt, isHalf)

})


function Sub1(txt, isHalf) {
  console.log('txt length:' + txt.length)
  setTimeout(() => { //見た目だけ　別にどっちでもいい
    document.getElementById("input_txt").style.transform = "translateY(100%)";
  }, 300)
  output = ""
  //スペースをすべて消す
  txt = Delete(txt, [' ', '\n', '\t'])
  img_file.addEventListener('change', function(e) {
    var file = e.target.files;
    var reader = new FileReader();
    reader.readAsDataURL(file[0])
    reader.onload = function() { // ファイル読み込みが完了した際のイベント登録
      dataUrl = this.result;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var image = new Image();
      image.src = dataUrl
      image.onload = function(event) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = this.width
        canvas.height = this.height
        ctx.drawImage(this, 0, 0)
        var pix = ctx.getImageData(0, 0, this.width, this.height).data
        pix_len = pix.length
        black = 0
        for (i = 0; i < pix_len; i += 4) { //pixデータは[r,g,b,a,r,g,b,a,...]で保存されている
          var grayscale = pix[i] * .3 + pix[i + 1] * .59 + pix[i + 2] * .11;
          if (grayscale < 170) { //グレー判定
            black += 1
          }
          if (grayscale < 85) { //黒判定
            black += 1
          } //grascaleが85未満のものはblackに2足される
        }
        console.log('image px:' + pix_len)
        var ratio = txt.length / black * 1.01 //誤差丸め込み
        canvas.width *= Math.sqrt(ratio)
        canvas.height *= Math.sqrt(ratio)
        ctx.drawImage(this, 0, 0, canvas.width, canvas.height)

        var pix = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        var pix_len = pix.length
        var j = 0
        for (i = 0; i < pix_len; i += 4) { //pixデータは[r,g,b,a,r,g,b,a,...]で保存されている
          var grayscale = pix[i] * .3 + pix[i + 1] * .59 + pix[i + 2] * .11;
          if (grayscale < 170) {
            output += txt.slice(j, j + 1)
            j += 1
          } else {
            output += " "
          }
          if (grayscale < 85) {
            output += txt.slice(j, j + 1)
            j += 1
          } else {
            output += " "
          }
          if ((i / 4 + 1) % canvas.width == 0) {
            output += "\n"
          }
        }
        DrowTxt(output, canvas)

      }

      //reader.readAsDataURL(file);
      setTimeout(() => { //見た目だけ　別にどっちでもいい
        document.getElementById("input_img").style.transform = "translateY(100%)"
      }, 300)
    }
  })
}

function Delete(txt, lst) {
  for (i = 0; i < lst.length; i++) {
    t = lst[i]
    while (txt.match(t)) {
      txt = txt.replace(t, "")
    }
  }
  return txt
}

function GetIsHalf(value) {
  return !value.match(/[^\x01-\x7E]/) || !value.match(/[^\uFF65-\uFF9F]/);
}

function DrowTxt(txt, canvas) {
  var r_canvas = document.createElement('canvas')
  var fontSize = 20
  var rctx = r_canvas.getContext('2d')
  r_canvas.width = canvas.width * fontSize
  r_canvas.height = canvas.height * fontSize
  rctx.beginPath();
  rctx.font = fontSize + "px MS Gothic"
  var lines = txt.split("\n")
  var addY = 1;
  for (i = 0; i < lines.length; i++) {
    var line = lines[i];
    addY += fontSize // 2行目以降の水平位置は行数とlineHeightを考慮する
    rctx.fillText(line, 0, addY);
  }
  var data = r_canvas.toDataURL();
  result=document.getElementById("result_img")
  result.src = data

  download_links=document.getElementById('download_links')
  flag=true
  result.addEventListener('click',function(){
    form.style.display="none"
    if(flag){
      result.style="transform:translateY(45%);max-height:1000vh;max-width:1000vw;"
      document.body.style.overflow="auto"
      download_links.style.opacity="0"
      flag=false
    }else{
      result.style="transform:translateY(0);max-height:80vh;max-width:90vw;"
      document.body.style.overflow="hidden"
      download_links.style.opacity="1"
      flag=true
    }

  })
  element = document.getElementById('download_link1')
  element.href = data

  var blob = new Blob([output], {
    "type": "text/plain"
  });
  if (window.navigator.msSaveBlob) {
    window.navigator.msSaveBlob(blob, "test.txt");
    window.navigator.msSaveOrOpenBlob(blob, "test.txt");
  } else {
    element = document.getElementById('download_link2')
    element.href = window.URL.createObjectURL(blob);
  }
  console.log(output)
  console.log(execCopy(output))
}

function execCopy(string){
  var temp = document.createElement('div');

  temp.appendChild(document.createElement('pre')).textContent = string;

  var s = temp.style;
  s.position = 'fixed';
  s.left = '-100%';

  document.body.appendChild(temp);
  document.getSelection().selectAllChildren(temp);

  var result = document.execCommand('copy');

  document.body.removeChild(temp);
  // true なら実行できている falseなら失敗か対応していないか
  return result;
}
