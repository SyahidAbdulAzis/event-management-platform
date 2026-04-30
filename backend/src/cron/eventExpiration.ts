import prisma from '../prisma/client'

// Check and update expired events
export async function checkEventExpiration() {
  console.log('RUN CRON: CHECK EVENT EXPIRATION')

  try {
    const now = new Date()

    // Update events that have passed their end date to EXPIRED
    const result = await prisma.event.updateMany({
      where: {
        endDate: {
          lt: now
        },
        status: 'ACTIVE'
      },
      data: {
        status: 'EXPIRED'
      }
    })

    if (result.count > 0) {
      console.log(`EXPIRED EVENTS UPDATED: ${result.count}`)
    }
  } catch (error) {
    console.error('Error checking event expiration:', error)
  }
}
