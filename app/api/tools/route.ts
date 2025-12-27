import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const toolSchema = z.object({
  name: z.string().min(1, 'Tool name is required'),
  type: z.string().min(1, 'Type is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  itemNumber: z.string().min(1, 'Item number is required'),
  status: z.string().default('ACTIVE'),
  unitOfMeasurement: z.string().min(1, 'Unit of measurement is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  price: z.number().min(0, 'Price must be non-negative'),
  datePurchased: z.string().min(1, 'Purchase date is required'),
  currency: z.string().min(1, 'Currency is required'),
  store: z.string().min(1, 'Store is required'),
  project: z.string().min(1, 'Project is required'),
  department: z.string().min(1, 'Department is required'),
  category: z.string().min(1, 'Category is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  description: z.string().min(1, 'Description is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  warrantyUrl: z.string().url().optional().or(z.literal('')),
  piDocumentUrl: z.string().url().optional().or(z.literal('')),
});

// GET - Fetch all tools for a store
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin and cashiers can view tools
    if (!['admin', 'cashier'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const type = url.searchParams.get('type') || '';
    const status = url.searchParams.get('status') || '';
    const category = url.searchParams.get('category') || '';

    // Build where clause
    const where: Record<string, unknown> = {};

    // Add store filter (users can only see tools from their store)
    if (user.storeId) {
      where.storeId = user.storeId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { itemNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Fetch tools with pagination
    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.tool.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        items: tools,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
    });
  } catch (error) {
    console.error('Get tools error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new tool
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can create tools
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only admins can create tools' },
        { status: 403 }
      );
    }

    if (!user.storeId) {
      return NextResponse.json(
        { success: false, message: 'User must be associated with a store' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Convert string numbers to actual numbers
    if (body.amount) body.amount = parseFloat(body.amount);
    if (body.price) body.price = parseFloat(body.price);
    
    // Validate input
    const validationResult = toolSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const toolData = validationResult.data;

    // Check if serial number already exists (if provided)
    const existingTool = await prisma.tool.findFirst({
      where: {
        serialNumber: toolData.serialNumber,
        storeId: user.storeId,
      },
    });

    if (existingTool) {
      return NextResponse.json(
        { success: false, message: 'A tool with this serial number already exists' },
        { status: 400 }
      );
    }

    // Create the tool
    const tool = await prisma.tool.create({
      data: {
        ...toolData,
        storeId: user.storeId,
        datePurchased: new Date(toolData.datePurchased),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Tool created successfully',
        data: tool,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create tool error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}