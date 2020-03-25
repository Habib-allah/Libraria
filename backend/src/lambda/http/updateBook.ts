import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId} from '../../helpers/authHelper'
import { UpdateBookRequest } from '../../requests/updateBookRequest'
import { BooksAccess } from '../../dataLayer/booksAccess'
import { ApiResponseHelper } from '../../helpers/apiResponseHelper'
import { createLogger } from '../../utils/logger'

const logger = createLogger('book')
const booksAccess = new BooksAccess()
const apiResponseHelper = new ApiResponseHelper()
//..
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
    const bookId = event.pathParameters.bookId
    const updatedBook: UpdateBookRequest = JSON.parse(event.body)
    const authHeader = event.headers['Authorization']
    const userId = getUserId(authHeader)
  
    const item = await booksAccess.getBookById(bookId)
  
    if(item.Count == 0){
        logger.error(`user ${userId} requesting update for non exists book with id ${bookId}`)
        return apiResponseHelper.generateErrorResponse(400,'BOOK does not exist')
    } 

    if(item.Items[0].userId !== userId){
        logger.error(`user ${userId} requesting update book does not belong to his account with id ${bookId}`)
        return apiResponseHelper.generateErrorResponse(400,'BOOK does not belong to authorized user')
    }

    logger.info(`User ${userId} updating group ${bookId} to be ${updatedBook}`)
    await new BooksAccess().updateBook(updatedBook,bookId,userId)
    return apiResponseHelper.generateEmptySuccessResponse(204)
  
}
