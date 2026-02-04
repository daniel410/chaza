import { prisma } from '@chaza/database';

interface AlertCheckResult {
  alertId: string;
  userId: string;
  productName: string;
  triggered: boolean;
  currentPrice: number;
  targetPrice: number | null;
  retailer: string;
}

interface AlertJobResult {
  startTime: Date;
  endTime: Date;
  alertsChecked: number;
  alertsTriggered: number;
  notificationsSent: number;
  errors: string[];
}

/**
 * Price Alert Job
 * 
 * This job checks all active price alerts and sends notifications
 * when conditions are met. Should run after price updates complete.
 */
export class PriceAlertJob {
  async run(): Promise<AlertJobResult> {
    const startTime = new Date();
    const errors: string[] = [];
    let alertsTriggered = 0;
    let notificationsSent = 0;

    console.log('[PriceAlertJob] Starting alert check...');

    // Get all active price alerts with user preferences
    const activeAlerts = await prisma.priceAlert.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            region: true,
            emailNotifications: true,
            pushNotifications: true,
          },
        },
        product: {
          include: {
            prices: {
              include: { retailer: true },
              orderBy: { currentPrice: 'asc' },
            },
          },
        },
      },
    });

    console.log(`[PriceAlertJob] Checking ${activeAlerts.length} active alerts`);

    for (const alert of activeAlerts) {
      try {
        // Filter prices by user's region
        const regionPrices = alert.product.prices.filter(
          (p) => p.retailer.region === alert.user.region
        );

        if (regionPrices.length === 0) continue;

        const lowestPrice = regionPrices[0];
        let shouldTrigger = false;

        switch (alert.alertType) {
          case 'PRICE_DROP':
            // Trigger if price drops below target
            if (alert.targetPrice && Number(lowestPrice.currentPrice) <= Number(alert.targetPrice)) {
              shouldTrigger = true;
            }
            break;

          case 'PRICE_CHANGE':
            // Trigger on any price change
            // Would need to compare with previous check
            // For now, check if lastChangedAt is recent
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            if (lowestPrice.lastChangedAt > oneHourAgo) {
              shouldTrigger = true;
            }
            break;

          case 'BACK_IN_STOCK':
            // Trigger if any retailer now has stock
            const hasStock = regionPrices.some((p) => p.inStock);
            if (hasStock) {
              shouldTrigger = true;
            }
            break;

          case 'DEAL':
            // Trigger if on sale
            const onSale = regionPrices.some((p) => p.isOnSale);
            if (onSale) {
              shouldTrigger = true;
            }
            break;
        }

        if (shouldTrigger) {
          alertsTriggered++;

          // Send notifications based on user preferences and alert channels
          const channels = alert.channels as string[];

          if (channels.includes('EMAIL') && alert.user.emailNotifications) {
            const sent = await this.sendEmailNotification(alert, lowestPrice);
            if (sent) notificationsSent++;
          }

          if (channels.includes('PUSH') && alert.user.pushNotifications) {
            const sent = await this.sendPushNotification(alert, lowestPrice);
            if (sent) notificationsSent++;
          }

          // Update alert record
          await prisma.priceAlert.update({
            where: { id: alert.id },
            data: {
              lastTriggeredAt: new Date(),
              triggerCount: { increment: 1 },
            },
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Alert ${alert.id}: ${errorMessage}`);
        console.error(`[PriceAlertJob] Error processing alert ${alert.id}:`, errorMessage);
      }
    }

    const endTime = new Date();

    const result: AlertJobResult = {
      startTime,
      endTime,
      alertsChecked: activeAlerts.length,
      alertsTriggered,
      notificationsSent,
      errors,
    };

    console.log('[PriceAlertJob] Job completed:', {
      duration: `${(endTime.getTime() - startTime.getTime()) / 1000}s`,
      alertsChecked: result.alertsChecked,
      alertsTriggered: result.alertsTriggered,
      notificationsSent: result.notificationsSent,
      errors: result.errors.length,
    });

    return result;
  }

  private async sendEmailNotification(alert: any, price: any): Promise<boolean> {
    // In production, this would use an email service like:
    // - SendGrid
    // - AWS SES
    // - Resend
    // - Postmark

    console.log(`[PriceAlertJob] Sending email to ${alert.user.email} for ${alert.product.name}`);

    const emailContent = {
      to: alert.user.email,
      subject: `Price Alert: ${alert.product.name}`,
      body: `
        Good news! The price for ${alert.product.name} has met your alert conditions.
        
        Current Price: ${price.currency} ${Number(price.currentPrice).toFixed(2)}
        Retailer: ${price.retailer.displayName}
        
        View product: ${price.productUrl}
        
        Manage your alerts: https://chaza.com/alerts
      `,
    };

    // Placeholder for actual email sending
    // await emailService.send(emailContent);

    return true;
  }

  private async sendPushNotification(alert: any, price: any): Promise<boolean> {
    // In production, this would use a push notification service like:
    // - Firebase Cloud Messaging (FCM)
    // - OneSignal
    // - Expo Push Notifications (for React Native)

    console.log(`[PriceAlertJob] Sending push notification to user ${alert.user.id} for ${alert.product.name}`);

    const notification = {
      title: 'Price Alert',
      body: `${alert.product.name} is now ${price.currency} ${Number(price.currentPrice).toFixed(2)} at ${price.retailer.displayName}`,
      data: {
        type: 'price_alert',
        productSlug: alert.product.slug,
        alertId: alert.id,
      },
    };

    // Placeholder for actual push notification
    // await pushService.send(alert.user.id, notification);

    return true;
  }
}

export const priceAlertJob = new PriceAlertJob();
