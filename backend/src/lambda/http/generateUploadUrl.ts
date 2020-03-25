import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { S3Helper } from '../../helpers/s3Helper';
import { ApiResponseHelper } from '../../helpers/apiResponseHelper';
import { BooksAccess } from '../../dataLayer/booksAccess'
import { getUserId} from '../../helpers/authHelper'
import { createLogger } from '../../utils/logger'

const booksAccess = new BooksAccess()
const apiResponseHelper = new ApiResponseHelper()
const logger = createLogger('books')
//..
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bookId = event.pathParameters.bookId
    const authHeader = event.headers['Authorization']
    const userId = getUserId(authHeader)
 
    const item = await booksAccess.getBookById(bookId)
    if(item.Count == 0){
        logger.error(`user ${userId} requesting put url for non existing book with id ${bookId}`)
        return apiResponseHelper.generateErrorResponse(400,'BOOK does not exist')
    }

    if(item.Items[0].userId !== userId){
        logger.error(`user ${userId} requesting put url book does not belong to his account with id ${bookId}`)
        return apiResponseHelper.generateErrorResponse(400,'BOOK does not belong to authorized user')
    }
    
    const url = new S3Helper().getPresignedUrl(bookId)
    return apiResponseHelper
            .generateDataSuccessResponse(200,"uploadUrl",url)
}
