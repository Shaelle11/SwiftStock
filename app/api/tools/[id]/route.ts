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

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch a single tool
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const tool = await prisma.tool.findFirst({
      where: {
        id,
        storeId: user.storeId || undefined,
      },
    });

    if (!tool) {
      return NextResponse.json(
        { success: false, message: 'Tool not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tool,
    });
  } catch (error) {
    console.error('Get tool error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a tool
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can update tools
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only admins can update tools' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    // Check if tool exists and belongs to user's store
    const existingTool = await prisma.tool.findFirst({
      where: {
        id,
        storeId: user.storeId || undefined,
      },
    });

    if (!existingTool) {
      return NextResponse.json(
        { success: false, message: 'Tool not found' },
        { status: 404 }
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

    // Check if serial number already exists (excluding current tool)
    if (toolData.serialNumber !== existingTool.serialNumber) {
      const duplicateTool = await prisma.tool.findFirst({
        where: {
          serialNumber: toolData.serialNumber,
          storeId: user.storeId || undefined,
          id: { not: id },
        },
      });

      if (duplicateTool) {
        return NextResponse.json(
          { success: false, message: 'A tool with this serial number already exists' },
          { status: 400 }
        );
      }
    }

    // Update the tool
    const updatedTool = await prisma.tool.update({
      where: { id },
      data: {
        ...toolData,
        datePurchased: new Date(toolData.datePurchased),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Tool updated successfully',
      data: updatedTool,
    });
  } catch (error) {
    console.error('Update tool error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a tool
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can delete tools
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only admins can delete tools' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if tool exists and belongs to user's store
    const existingTool = await prisma.tool.findFirst({
      where: {
        id,
        storeId: user.storeId || undefined,
      },
    });

    if (!existingTool) {
      return NextResponse.json(
        { success: false, message: 'Tool not found' },
        { status: 404 }
      );
    }

    // Delete the tool
    await prisma.tool.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Tool deleted successfully',
    });
  } catch (error) {
    console.error('Delete tool error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}