import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, patchBook } from '../api/books-api'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditBookProps {
  match: {
    params: {
      bookId: string
    }
  },
  location:{
    state:{
      title:string,
      author:string,
      description:string
    }
  }
  auth: Auth
}

interface EditBookState {
  file: any
  title: string
  author: string
  description: string
  uploadState: UploadState
}

export class EditBook extends React.PureComponent<
  EditBookProps,
  EditBookState
  > {
  state: EditBookState = {
    file: undefined,
    title: this.props.location.state.title,
    author: this.props.location.state.author,
    description: this.props.location.state.description,
    uploadState: UploadState.NoUpload
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ title: event.target.value })
  }

  handleAuthorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ author: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ description: event.target.value })
  }

  updateBook = async () => {
    try {
      await patchBook(this.props.auth.getIdToken(), this.props.match.params.bookId, {
        title: this.state.title,
        description: this.state.description,
        author: this.state.author,
      })
      alert('Book updated successfully!')
    } catch {
      alert('Book update failed')
    }
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.bookId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Update A Book!</h1>
        {console.log(this.props.location.state)}
        <Form onSubmit={this.updateBook}>
          <Form.Field width={5}>
            <label>Title</label>
            <input placeholder='Title' onChange={this.handleTitleChange} value={this.state.title} />
          </Form.Field>
          <Form.Field width={5}>
            <label>Author</label>
            <input placeholder='Author' onChange={this.handleAuthorChange} value={this.state.author} />
          </Form.Field>
          <Form.Field width={5}>
            <label>Description</label>
            <input placeholder='Desciption' onChange={this.handleDescriptionChange} value={this.state.description} />
          </Form.Field>
          <Button
            type="submit"
            color='grey'
          >
            Update
          </Button>
        </Form>
        <hr/>
        <h1>Upload A Book!</h1>
        <Form onSubmit={this.handleSubmit}>
          <Form.Field width={5}>
            <label>File</label>
            <input
              type="file"
              accept="application/pdf"
              placeholder="Pdf to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>
          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading book metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
          color='grey'
        >
          Upload
        </Button>
      </div>
    )
  }
}
