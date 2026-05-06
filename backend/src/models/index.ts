import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";
import { sequelize } from "../lib/sequelize.js";

export class Admin extends Model<InferAttributes<Admin>, InferCreationAttributes<Admin>> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare passwordHash: string;
  declare fullName: string;
  declare role: CreationOptional<"SUPER_ADMIN" | "STAFF">;
  declare isActive: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Admin.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("SUPER_ADMIN", "STAFF"),
      allowNull: false,
      defaultValue: "SUPER_ADMIN",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "admins" },
);

export class RefreshToken extends Model<
  InferAttributes<RefreshToken>,
  InferCreationAttributes<RefreshToken>
> {
  declare id: CreationOptional<string>;
  declare token: string;
  declare adminId: string;
  declare expiresAt: Date;
  declare revokedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "refresh_tokens" },
);

export class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
  declare id: CreationOptional<string>;
  declare slug: string;
  declare name: string;
  declare image: string;
  declare category: string;
  declare textureStyle: string;
  declare length: string;
  declare color: string;
  declare stock: number;
  declare price: number;
  declare description: string;
  declare featured: CreationOptional<boolean>;
  declare status: CreationOptional<"IN_STOCK" | "OUT_OF_STOCK">;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    textureStyle: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "texture_style",
    },
    length: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("IN_STOCK", "OUT_OF_STOCK"),
      allowNull: false,
      defaultValue: "IN_STOCK",
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "products" },
);

export class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
  declare id: CreationOptional<string>;
  declare reference: string;
  declare customerName: string;
  declare customerPhone: string;
  declare customerEmail: CreationOptional<string | null>;
  declare address: string;
  declare city: string;
  declare status: CreationOptional<"PENDING" | "PAID" | "PROCESSING" | "DELIVERED" | "CANCELLED">;
  declare paymentMethod: "MOMO" | "CARD";
  declare paymentStatus: CreationOptional<"PENDING" | "SUCCESS" | "FAILED">;
  declare deliveryTimeline: CreationOptional<"SAME_DAY" | "NEXT_DAY">;
  declare deliveryStatus: CreationOptional<"PENDING" | "SCHEDULED" | "OUT_FOR_DELIVERY" | "DELIVERED">;
  declare subtotalAmount: number;
  declare totalAmount: number;
  declare notes: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "PAID", "PROCESSING", "DELIVERED", "CANCELLED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    paymentMethod: {
      type: DataTypes.ENUM("MOMO", "CARD"),
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    deliveryTimeline: {
      type: DataTypes.ENUM("SAME_DAY", "NEXT_DAY"),
      allowNull: false,
      defaultValue: "NEXT_DAY",
      field: "delivery_timeline",
    },
    deliveryStatus: {
      type: DataTypes.ENUM("PENDING", "SCHEDULED", "OUT_FOR_DELIVERY", "DELIVERED"),
      allowNull: false,
      defaultValue: "PENDING",
      field: "delivery_status",
    },
    subtotalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "subtotal_amount",
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "total_amount",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "orders" },
);

export class OrderItem extends Model<InferAttributes<OrderItem>, InferCreationAttributes<OrderItem>> {
  declare id: CreationOptional<string>;
  declare orderId: string;
  declare productId: string;
  declare productName: string;
  declare quantity: number;
  declare unitPrice: number;
  declare color: string;
  declare length: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "product_name",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "unit_price",
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    length: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "order_items" },
);

export class SaleCampaign extends Model<
  InferAttributes<SaleCampaign>,
  InferCreationAttributes<SaleCampaign>
> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare description: string;
  declare isEnabled: CreationOptional<boolean>;
  declare startsAt: CreationOptional<Date | null>;
  declare endsAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

SaleCampaign.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_enabled",
    },
    startsAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "starts_at",
    },
    endsAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "ends_at",
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "sale_campaigns" },
);

export class SaleItem extends Model<InferAttributes<SaleItem>, InferCreationAttributes<SaleItem>> {
  declare id: CreationOptional<string>;
  declare saleCampaignId: string;
  declare productId: string;
  declare salePrice: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

SaleItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    saleCampaignId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "sale_campaign_id",
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "product_id",
    },
    salePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "sale_price",
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "sale_items",
    indexes: [
      {
        unique: true,
        fields: ["sale_campaign_id", "product_id"],
      },
    ],
  },
);

export class SiteContent extends Model<
  InferAttributes<SiteContent>,
  InferCreationAttributes<SiteContent>
> {
  declare id: CreationOptional<string>;
  declare key: string;
  declare content: object;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

SiteContent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "site_content" },
);

export class Review extends Model<InferAttributes<Review>, InferCreationAttributes<Review>> {
  declare id: CreationOptional<string>;
  declare productId: string;
  declare customerName: string;
  declare rating: number;
  declare text: string;
  declare status: CreationOptional<"PENDING" | "APPROVED" | "REJECTED">;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Review.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "product_id",
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "customer_name",
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "reviews",
    indexes: [{ fields: ["product_id", "status"] }],
  },
);

Admin.hasMany(RefreshToken, { foreignKey: "adminId", as: "refreshTokens" });
RefreshToken.belongsTo(Admin, { foreignKey: "adminId", as: "admin" });

Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });

Product.hasMany(OrderItem, { foreignKey: "productId", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

SaleCampaign.hasMany(SaleItem, { foreignKey: "saleCampaignId", as: "items" });
SaleItem.belongsTo(SaleCampaign, { foreignKey: "saleCampaignId", as: "saleCampaign" });

Product.hasMany(SaleItem, { foreignKey: "productId", as: "saleItems" });
SaleItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

Product.hasMany(Review, { foreignKey: "productId", as: "reviews" });
Review.belongsTo(Product, { foreignKey: "productId", as: "product" });

export const models = {
  Admin,
  RefreshToken,
  Product,
  Order,
  OrderItem,
  SaleCampaign,
  SaleItem,
  SiteContent,
  Review,
};
