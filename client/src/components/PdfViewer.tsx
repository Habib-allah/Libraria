import * as React from 'react'
import Auth from '../auth/Auth'
import { Button, Icon, Label, Grid } from 'semantic-ui-react'
import {pdfjs,Document,Page} from 'react-pdf'
import {StyleSheet} from '@react-pdf/renderer'
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


interface PdfViewerProps {
  match: {
    params: {
      bookId: string
    }
  },
  location: {
    state: {
      attachmentUrl: string
    }
  }
  auth: Auth
}


export class PdfViewer extends React.PureComponent<
  PdfViewerProps, any
  > {
  state = {
    numPages: null,
    pageNumber: 1,
  }
  styles=StyleSheet.create({
    page: { textAlign: 'center',display:'flex' }
  })

  onDocumentLoadSuccess = ({ numPages }: any) => {
    this.setState({ numPages });
  }

  goToPrevPage = () => {
    if (this.state.pageNumber == 1) return
    this.setState({ pageNumber: this.state.pageNumber - 1 });
  }


  goToNextPage = () => {
    if (this.state.pageNumber == this.state.numPages) return
    this.setState({ pageNumber: this.state.pageNumber + 1 });
  }

  removeTextLayerOffset() {
     const textLayers = document.querySelectorAll(".react-pdf__Page__canvas");
      textLayers.forEach((layer) => {
        const { style } = layer as HTMLElement;
        style.display="inline"        
    });
  }

  render() {
    const { pageNumber, numPages } = this.state;

    return (

      <div style={{ textAlign: "center" }}>
        <nav style={{ textAlign: "center" }}>
          <Button icon color="grey" onClick={this.goToPrevPage}>
            <Icon name="arrow alternate circle left" />
          </Button>

          <Button icon color="grey" onClick={this.goToNextPage}>
            <Icon name="arrow alternate circle right" />
          </Button>
        </nav>
            <Document style={this.styles.page} 
              file={this.props.location.state.attachmentUrl}
              //file="./test.pdf"
              onLoadSuccess={this.onDocumentLoadSuccess}
            >
              <Page pageNumber={pageNumber} onLoadSuccess={this.removeTextLayerOffset} renderTextLayer={false} />
            </Document>
          
        <Grid>
          <Grid.Column textAlign="center">
            <Label as='a' color='grey' inline="centered">
              {pageNumber}
              <Label.Detail>{numPages}</Label.Detail>
            </Label>
          </Grid.Column>
        </Grid>
      </div>

    );
  }
}



