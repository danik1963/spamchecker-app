const request = require('supertest')
const express = require('express')
const phonesRouter = require('../src/routes/phones')

// Create test app
const app = express()
app.use(express.json())
app.use('/api/phones', phonesRouter)

describe('API Endpoints', () => {
  describe('GET /api/phones/recent', () => {
    it('should return array of records', async () => {
      const res = await request(app)
        .get('/api/phones/recent')
        .query({ platform: 'phone', limit: 10 })
      
      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    it('should respect limit parameter', async () => {
      const res = await request(app)
        .get('/api/phones/recent')
        .query({ platform: 'phone', limit: 5 })
      
      expect(res.statusCode).toBe(200)
      expect(res.body.length).toBeLessThanOrEqual(5)
    })

    it('should filter by platform', async () => {
      const res = await request(app)
        .get('/api/phones/recent')
        .query({ platform: 'instagram' })
      
      expect(res.statusCode).toBe(200)
      res.body.forEach(record => {
        expect(record.platform).toBe('instagram')
      })
    })
  })

  describe('GET /api/phones/search/:identifier', () => {
    it('should return not found for non-existent number', async () => {
      const res = await request(app)
        .get('/api/phones/search/+79999999999')
        .query({ platform: 'phone' })
      
      expect(res.statusCode).toBe(200)
      expect(res.body.found).toBe(false)
    })
  })

  describe('POST /api/phones/report', () => {
    it('should require identifier', async () => {
      const res = await request(app)
        .post('/api/phones/report')
        .send({ deviceId: 'test-device' })
      
      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBeDefined()
    })

    it('should require deviceId', async () => {
      const res = await request(app)
        .post('/api/phones/report')
        .send({ identifier: '+77001234567' })
      
      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBeDefined()
    })

    it('should create report with valid data', async () => {
      const testPhone = `+7700${Date.now().toString().slice(-7)}`
      const res = await request(app)
        .post('/api/phones/report')
        .send({
          identifier: testPhone,
          platform: 'phone',
          category: 'spam',
          deviceId: `test-device-${Date.now()}`
        })
      
      expect(res.statusCode).toBe(200)
      expect(res.body.identifier).toBeDefined()
      expect(res.body.platform).toBe('phone')
      expect(res.body.category).toBe('spam')
    })

    it('should normalize phone number', async () => {
      const testPhone = `8700${Date.now().toString().slice(-7)}`
      const res = await request(app)
        .post('/api/phones/report')
        .send({
          identifier: testPhone,
          platform: 'phone',
          category: 'fraud',
          deviceId: `test-device-${Date.now()}`
        })
      
      expect(res.statusCode).toBe(200)
      expect(res.body.identifier).toMatch(/^\+7/)
    })

    it('should reject duplicate report from same device', async () => {
      const testPhone = `+7700${Date.now().toString().slice(-7)}`
      const deviceId = `test-device-duplicate-${Date.now()}`
      
      // First report
      await request(app)
        .post('/api/phones/report')
        .send({
          identifier: testPhone,
          platform: 'phone',
          category: 'spam',
          deviceId
        })
      
      // Duplicate report
      const res = await request(app)
        .post('/api/phones/report')
        .send({
          identifier: testPhone,
          platform: 'phone',
          category: 'spam',
          deviceId
        })
      
      expect(res.statusCode).toBe(400)
      expect(res.body.error).toContain('уже')
    })
  })

  describe('POST /api/phones/:recordId/comments', () => {
    it('should require text', async () => {
      const res = await request(app)
        .post('/api/phones/some-id/comments')
        .send({ deviceId: 'test' })
      
      expect(res.statusCode).toBe(400)
    })

    it('should reject comment longer than 500 chars', async () => {
      const longText = 'a'.repeat(501)
      const res = await request(app)
        .post('/api/phones/some-id/comments')
        .send({ 
          text: longText,
          deviceId: 'test'
        })
      
      expect(res.statusCode).toBe(400)
      expect(res.body.error).toContain('длинный')
    })

    it('should return 404 for non-existent record', async () => {
      const res = await request(app)
        .post('/api/phones/non-existent-id/comments')
        .send({ 
          text: 'Test comment',
          deviceId: 'test'
        })
      
      expect(res.statusCode).toBe(404)
    })
  })
})
