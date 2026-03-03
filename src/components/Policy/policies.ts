// src/components/Policy/policies.ts
export interface PolicyData {
  id: string;
  title: string;
  content: string[];
}

export const POLICIES: PolicyData[] = [
  {
    id: 'return-exchange',
    title: 'Return & Exchange Policy',
    content: [
      'Returns and exchanges are accepted within 7 days of delivery.',
      'The product must be unused, unwashed, and in its original packaging with all tags intact.',
      'Sale items and customized sarees are non-returnable.',
      'To initiate a return/exchange, WhatsApp us at our business number with your order details and product photos.',
      'Approved returns will receive a store credit or exchange within 5-7 business days.',
      'Shipping charges for returns are borne by the customer unless the product is defective.',
    ],
  },
  {
    id: 'cancellation',
    title: 'Cancellation Policy',
    content: [
      'Orders can be cancelled within 12 hours of placing the order.',
      'Once the order is dispatched, cancellation is not possible.',
      'To cancel, contact us immediately via WhatsApp with your order details.',
      'Approved cancellations will receive a full refund within 5-7 business days.',
      'Customized or made-to-order items cannot be cancelled once production begins.',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    content: [
      'We collect only the information necessary to process your order (name, contact details, shipping address).',
      'Your personal data is never sold or shared with third parties for marketing purposes.',
      'We use WhatsApp Business to communicate order updates and respond to inquiries.',
      'Payment information is processed securely and we do not store card details.',
      'You have the right to request deletion of your personal data at any time.',
      'By using our website, you consent to our data practices as outlined in this policy.',
    ],
  },
  {
    id: 'refund',
    title: 'Refund Policy',
    content: [
      'Refunds are processed within 5-7 business days of return approval.',
      'Refunds will be issued to the original payment method or as store credit.',
      'Shipping charges are non-refundable unless the return is due to our error.',
      'Damaged or defective products are eligible for full refunds including shipping.',
      'Partial refunds may be granted for items not in their original condition.',
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping Policy',
    content: [
      'We ship pan-India. Standard delivery takes 5-7 business days.',
      'Free shipping on orders above ₹2000.',
      'Express shipping (2-3 business days) is available at an additional charge.',
      'Once shipped, you will receive a tracking number via WhatsApp.',
      'We are not responsible for delays caused by courier partners or natural events.',
      'International shipping is currently not available.',
    ],
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    content: [
      'By accessing Wing & Weft, you agree to be bound by these terms.',
      'All product images are for representation purposes. Slight color variations may occur due to screen settings.',
      'Wing & Weft reserves the right to modify prices, products, and policies at any time.',
      'Unauthorized use of our content, images, or branding is strictly prohibited.',
      'We reserve the right to cancel orders that appear fraudulent or in violation of our policies.',
      'Any disputes shall be subject to the jurisdiction of courts in India.',
    ],
  },
];
