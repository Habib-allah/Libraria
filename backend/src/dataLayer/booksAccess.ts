import { BookItem } from "../models/bookItem";
import { CreateBookRequest } from "../requests/createBookRequest";
import { UpdateBookRequest } from "../requests/updateBookRequest";
const uuid = require('uuid/v4')
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

//..


export class BooksAccess{
    constructor(
        private readonly XAWS = AWSXRay.captureAWS(AWS),
        private readonly docClient: AWS.DynamoDB.DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly booksTable = process.env.BOOK_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX
    )
        {}

    async getUserBooks(userId: string): Promise<BookItem[]>{
        const result = await this.docClient.query({
            TableName: this.booksTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues:{
                ':userId':userId
            }
        }).promise()
        return result.Items as BookItem[]
    }

    async createBook(request: CreateBookRequest,userId: string): Promise<BookItem>{
        const newId = uuid()
        const item = new BookItem()
        item.userId= userId
        item.bookId= newId
        item.createdAt= new Date().toISOString()
        item.title= request.title
        item.author= request.author
  
        await this.docClient.put({
            TableName: this.booksTable,
            Item: item
        }).promise()

        return item
    }


    async getBookById(id: string): Promise<AWS.DynamoDB.QueryOutput>{
        return await this.docClient.query({
            TableName: this.booksTable,
            KeyConditionExpression: 'bookId = :bookId',
            ExpressionAttributeValues:{
                ':bookId': id
            }
        }).promise()
    }

    async updateBook(updatedBook:UpdateBookRequest,bookId:string,userId:string){
        await this.docClient.update({
            TableName: this.booksTable,
            Key:{
                'bookId':bookId,
                'userId':userId
            },
            UpdateExpression: 'set #titlefield = :t, author = :a, description = :d',
            ExpressionAttributeValues: {
                ':t' : updatedBook.title,
                ':a' : updatedBook.author,
                ':d' : updatedBook.description
            },
            ExpressionAttributeNames:{
                "#titlefield": "title"
              }
          }).promise()
    }

    async deleteBookById(bookId: string,userId:string){
        const param = {
            TableName: this.booksTable,
            Key:{
                "bookId":bookId,
                "userId":userId
            }
        }
      
         await this.docClient.delete(param).promise()
    }
    
}