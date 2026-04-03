import 'dotenv/config'
import { createApp } from './app.js'
import './lib/db.js'

const port = Number(process.env.PORT ?? 4000)
const app = createApp()

app.listen(port, () => {
  console.log(`Koude Library API running at http://localhost:${port}`)
})
