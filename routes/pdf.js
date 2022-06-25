

/*#######################################################################
* #         증명서 PDF발급                                             #
* #####################################################################*/

var PDFDocument = require('pdfkit');
var fs = require('fs');

var pdf = function(member){
  doc = new PDFDocument

  doc.pipe(fs.createWriteStream('./pdf/'+member.tx+'.pdf'));

  doc.font('./pdf/fonts/malgun.ttf')
     .fontSize(20)
     .text('Blockchain Digital Stamping Certificate', 130, 100)

  doc.moveDown()
     .fontSize(10)
     .text('The electronic document accompanying this certificate has been digitally stamped by embedding its SHA256 hash imprint within the blockchain public ledger maintained in the decentralized bitcoin cryptocurrency network.', 50, 150)
  doc.moveDown()
     .fontSize(10)
     .text('TimeStamp : ', 50, 220)

  doc.moveDown()
     .fontSize(10)
     .fill('blue')
     .text(member.time, 160, 220)

  doc.moveDown()
    .fill('black')
    .fontSize(10)
    .text('Transaction ID : ', 50, 250)

  doc.moveDown()
    .fontSize(10)
    .fill('blue')
    .text(member.tx, 160, 250)


  doc.moveDown()
    .fontSize(10)
    .fill('black')
    .text('File Hash(SHA256) : ', 50, 280)

  doc.moveDown()
    .fontSize(10)
    .fill('blue')
    .text(member.hash, 160, 280)

  doc.moveDown()
    .fontSize(10)
    .fill('black')
    .text('File Name : ', 50, 310)

  doc.moveDown()
    .fontSize(10)
    .fill('blue')
    .text(member.filename, 160, 310)

  doc.moveDown()
    .fontSize(10)
    .fill('black')
    .text('File Size : ', 50, 340)

  doc.moveDown()
    .fontSize(10)
    .fill('blue')
    .text(member.filesize, 160, 340)

  doc.moveDown()
  .fontSize(15)
  .fill('black')
  .text("STAMPANG", 237, 396)

  doc.image('./img/stamp.png', 320, 385, {width: 45, height: 45});
  doc.image('./img/'+member.tx+'.png', 460, 370, {width: 60, height: 60});

  doc.end();

}

exports.pdf = pdf;
