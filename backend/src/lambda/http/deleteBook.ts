import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId} from '../../helpers/authHelper'
import { BooksAccess } from '../../dataLayer/booksAccess'
import { ApiResponseHelper } from '../../helpers/apiResponseHelper'
import { createLogger } from '../../utils/logger'

const booksAccess = new BooksAccess()
const apiResponseHelper = new ApiResponseHelper()
const logger = createLogger('books')
//..
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bookId = event.pathParameters.bookId
    if(!bookId){
        logger.error('invalid delete attempt without book id')
        return apiResponseHelper.generateErrorResponse(400,'invalid parameters')
    }
 
    const authHeader = event.headers['Authorization']
    const userId = getUserId(authHeader)

    const item = await booksAccess.getBookById(bookId)
    if(item.Count == 0){
        logger.error(`user ${userId} requesting delete for non existing book with id ${bookId}`)
        return apiResponseHelper.generateErrorResponse(400,'Book does not exist')
    }

    if(item.Items[0].userId !== userId){
        logger.error(`user ${userId} requesting delete book does not belong to his account with id ${bookId}`)
        return apiResponseHelper.generateErrorResponse(400,'BOOK does not belong to this user')
    }

    logger.info(`User ${userId} deleting book ${bookId}`)
    await booksAccess.deleteBookById(bookId,userId)
    return apiResponseHelper.generateEmptySuccessResponse(204)

  
} 
