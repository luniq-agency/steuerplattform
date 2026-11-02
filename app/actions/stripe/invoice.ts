'use server';
import { Invoice, InvoiceItem, User } from '@/app/types/Database';
import Stripe from 'stripe';
import { createStripeCustomer } from '../stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

