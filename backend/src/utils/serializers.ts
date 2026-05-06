import {
  Order,
  OrderItem,
  Product,
  RefreshToken,
  Review,
  SaleCampaign,
  SaleItem,
  SiteContent,
  GalleryItem,
} from "../models/index.js";

const parsePrice = (value: number | string) => Number(value);

export const serializeProduct = (product: Product) => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  image: product.image,
  video: product.video,
  category: product.category,
  textureStyle: product.textureStyle,
  length: product.length,
  color: product.color,
  stock: product.stock,
  price: parsePrice(product.price),
  description: product.description,
  featured: product.featured,
  status: product.status,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

export const serializeSaleItem = (item: SaleItem & { product?: Product | null }) => ({
  id: item.id,
  productId: item.productId,
  salePrice: parsePrice(item.salePrice),
  product: item.product ? serializeProduct(item.product) : null,
});

export const serializeSaleCampaign = (
  campaign: SaleCampaign & { items?: Array<SaleItem & { product?: Product | null }> },
) => ({
  id: campaign.id,
  title: campaign.title,
  description: campaign.description,
  isEnabled: campaign.isEnabled,
  startsAt: campaign.startsAt,
  endsAt: campaign.endsAt,
  items: campaign.items?.map(serializeSaleItem) ?? [],
  createdAt: campaign.createdAt,
  updatedAt: campaign.updatedAt,
});

export const serializeSiteContent = (entry: SiteContent) => ({
  id: entry.id,
  key: entry.key,
  content: entry.content,
  createdAt: entry.createdAt,
  updatedAt: entry.updatedAt,
});

export const serializeReview = (review: Review & { product?: Product | null }) => ({
  id: review.id,
  productId: review.productId,
  productName: review.product?.name ?? null,
  customerName: review.customerName,
  rating: review.rating,
  text: review.text,
  status: review.status,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
});

export const serializeGalleryItem = (item: GalleryItem) => ({
  id: item.id,
  mediaType: item.mediaType,
  mediaUrl: item.mediaUrl,
  customerName: item.customerName,
  caption: item.caption,
  isPublished: item.isPublished,
  sortOrder: item.sortOrder,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export const serializeOrderItem = (item: OrderItem) => ({
  id: item.id,
  productId: item.productId,
  productName: item.productName,
  quantity: item.quantity,
  unitPrice: parsePrice(item.unitPrice),
  color: item.color,
  length: item.length,
});

export const serializeOrder = (order: Order & { items?: OrderItem[] }) => ({
  id: order.id,
  reference: order.reference,
  customerName: order.customerName,
  customerPhone: order.customerPhone,
  customerEmail: order.customerEmail,
  address: order.address,
  city: order.city,
  status: order.status,
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  deliveryTimeline: order.deliveryTimeline,
  deliveryStatus: order.deliveryStatus,
  subtotalAmount: parsePrice(order.subtotalAmount),
  totalAmount: parsePrice(order.totalAmount),
  notes: order.notes,
  items: order.items?.map(serializeOrderItem) ?? [],
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

export const serializeRefreshToken = (token: RefreshToken) => ({
  id: token.id,
  adminId: token.adminId,
  expiresAt: token.expiresAt,
  revokedAt: token.revokedAt,
  createdAt: token.createdAt,
  updatedAt: token.updatedAt,
});
