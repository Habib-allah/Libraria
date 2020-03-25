import { History } from 'history'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Popup,
  Loader,
  Card,
  Form
} from 'semantic-ui-react'

import { createBook, deleteBook, getBooks } from '../api/books-api'
import Auth from '../auth/Auth'
import { Book } from '../types/Book'

interface BooksProps {
  auth: Auth
  history: History
}

interface BooksState {
  books: Book[]
  newBookTitle: string
  newBookDescription: string
  newBookAuthor: string
  loadingBooks: boolean
}

export class Books extends React.PureComponent<BooksProps, BooksState> {
  state: BooksState = {
    books: [],
    newBookTitle: '',
    newBookDescription: '',
    newBookAuthor: '',
    loadingBooks: true
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookTitle: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookDescription: event.target.value })
  }

  handleAuthorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookAuthor: event.target.value })
  }

  onEditButtonClick = (book: Book) => {
    this.props.history.push({
      pathname: `/books/${book.bookId}/edit`,
      state: {
        title: book.title,
        author: book.author,
        description: book.description
      }
    })
  }

  onBookRead = (book: Book) => {
    this.props.history.push({
      pathname: `/books/${book.bookId}/read`,
      state: {
        attachmentUrl: book.attachmentUrl
      }
    })
  }

  onBookCreate = async () => {
    try {
      if (this.state.newBookAuthor === "" || this.state.newBookTitle == "") {
        alert("Title & Author Are Both Required!")
        return
      }
      const newBook = await createBook(this.props.auth.getIdToken(), {
        title: this.state.newBookTitle,
        author: this.state.newBookAuthor
      })
      this.setState({
        books: [...this.state.books, newBook],
        newBookTitle: '',
        newBookAuthor: '',
        newBookDescription: ''
      })
    } catch {
      alert('Book creation failed')
    }
  }

  onBookDelete = async (bookId: string) => {
    try {
      await deleteBook(this.props.auth.getIdToken(), bookId)
      this.setState({
        books: this.state.books.filter(book => book.bookId != bookId)
      })
    } catch {
      alert('Book deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const books = await getBooks(this.props.auth.getIdToken())
      this.setState({
        books,
        loadingBooks: false
      })
    } catch (e) {
      alert(`Failed to fetch books: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Books</Header>

        {this.renderCreateBookInput()}

        {this.renderBooks()}
      </div>
    )
  }

  renderCreateBookInput() {
    return (<div>
      <Form onSubmit={this.onBookCreate}>
        <Form.Field width={5}>
          <label>Title</label>
          <input placeholder='Title of the book' onChange={this.handleTitleChange} value={this.state.newBookTitle} />
        </Form.Field>
        <Form.Field width={5}>
          <label>Author</label>
          <input placeholder='Author of the book' onChange={this.handleAuthorChange} value={this.state.newBookAuthor} />
        </Form.Field>

        <Button
          type="submit"
          color='grey'
        >
          New Book!
          </Button>
      </Form>
      <Divider /></div>)

  }

  renderBooks() {
    if (this.state.loadingBooks) {
      return this.renderLoading()
    }

    return this.renderBooksList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Books!
        </Loader>
      </Grid.Row>
    )
  }

  renderBooksList() {
    return (<div>
      <h1>Your Books:</h1>
      <Card.Group>
        {this.state.books.map((book, pos) => {
          return (
            <Card key={book.bookId}>
              <Card.Content>
                <Card.Header>{book.title}</Card.Header>
                <Card.Meta>{book.author}</Card.Meta>
                <Card.Description>
                  {book.description}
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <div >
                  <Popup content='Edit or upload a book!' trigger={
                    <Button icon color="green" onClick={this.onEditButtonClick.bind(this, book)}>
                      <Icon name="pencil" />
                    </Button>
                  }></Popup>

                  <Popup content='Delete this book!' trigger={
                    <Button icon color='google plus' onClick={this.onBookDelete.bind(this, book.bookId)}>
                      <Icon name="trash" />
                    </Button>
                  }></Popup>

                  {(book.attachmentUrl) ? (
                    <Popup content='Read this book!' trigger={
                      <Button icon color='instagram' onClick={this.onBookRead.bind(this, book)}>
                        <Icon name="book" />
                      </Button>
                    }></Popup>

                  ) : null}

                </div>
              </Card.Content>
            </Card>)
        })
        } </Card.Group> </div>)
  }//END OF METHOD

}


