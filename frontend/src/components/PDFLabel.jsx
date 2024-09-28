import { Document, Page, Text, View, Image } from '@react-pdf/renderer';

function Label({ id, name, labelNum }) {
  return (
    <Document>
      <Page>
        <View style={{ position: 'relative', height: '55vw', width: '100%', backgroundImage: `url('/img/label_${labelNum}.png')`, backgroundSize: 'cover' }}>
          <Text style={{ position: 'absolute', left: 40, top: 30, width: 100, fontSize: 12 }}>{name}</Text>
          <Image
            src={`/api//boxes/${id}/items/qr-code.png`} // Pre-generate the QR code as an image
            style={{ position: 'absolute', bottom: 30, left: 40, height: 100, width: 100 }}
          />
        </View>
      </Page>
    </Document>
  );
}

export default Label;
