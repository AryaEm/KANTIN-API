import express from 'express'
import cors from 'cors'
import swaggerJsDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import path from 'path'

import UserRoute from './routers/user_route'
import MenuRoute from './routers/menu_route'
import DiskonRoute from './routers/diskon_route'
import OrderRoute from './routers/order_route'

import { PORT } from './global'

const app = express()
app.use(cors())
app.use(express.json())

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Ordering System API',
            version: '1.0.0',
            description: 'API documentation for the ordering system',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routers/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

app.use(`/user`, UserRoute)
app.use(`/menu`, MenuRoute)
app.use(`/diskon`, DiskonRoute)
app.use(`/order`, OrderRoute)

app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`)
})