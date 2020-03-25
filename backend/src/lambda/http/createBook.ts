import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateBookRequest } from '../../requests/createBookRequest'
import { getUserId} from '../../helpers/authHelper'
import { BooksAccess } from '../../dataLayer/booksAccess'
import { ApiResponseHelper } from '../../helpers/apiResponseHelper'
import { createLogger } from '../../utils/logger'

const logger = createLogger('books')
//..
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
    const newBook: CreateBookRequest = JSON.parse(event.body)

    
    const authHeader = event.headers['Authorization']
    const userId = getUserId(authHeader)
    logger.info(`create book for user ${userId} with data ${newBook}`)
    const item = await new BooksAccess().createBook(newBook,userId)
    
    return new ApiResponseHelper().generateDataSuccessResponse(201,'item',item)

}
