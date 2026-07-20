'use client';

import { FormField } from '@/components/form-field';
import { Button } from '@workspace/ui/components/button';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { Card } from '@workspace/ui/components/uwezo/card';
import type { FC } from 'react';

export const IndividualLookupForm: FC<{ error?: string }> = ({ error }) => (
  <Container className="py-10 max-w-xl">
    <Card radius="lg" variant="primary" className="space-y-4 p-6">
      <h1 className="typo-h4">Individual Application</h1>
      <p className="typo-body-medium">
        Enter your national ID to continue your individual Wezesha Majuu application.
      </p>
      {error === 'not-found' && (
        <p className="text-destructive typo-body-small">
          No group member record found. Complete the group application first or check
          your ID number.
        </p>
      )}
      <Form action="/apply/individual/start" method="get" className="space-y-4">
        <FormField
          name="idNo"
          label="National ID Number"
          required
          placeholder="Enter national ID"
        />
        <Button type="submit" className="w-full md:w-auto">
          Continue
        </Button>
      </Form>
    </Card>
  </Container>
);
