'use client';

import { FormField } from '@/components/form-field';
import { Button } from '@workspace/ui/components/button';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import type { FC, ReactNode } from 'react';

export const StatusSearchForm: FC<{
  ack?: string;
  idNo?: string;
  children?: ReactNode;
}> = ({ ack, idNo, children }) => (
  <Container className="space-y-6 py-10">
    <FormCard title="Track Application Status">
      <Form method="get" className="grid gap-4 md:grid-cols-2">
        <FormField
          name="ack"
          label="Group Acknowledgment Number"
          defaultValue={ack ?? ''}
          placeholder="UWZ-..."
        />
        <FormField
          name="idNo"
          label="Member National ID"
          defaultValue={idNo ?? ''}
        />
        <Button type="submit" className="md:col-span-2 w-fit">
          Search
        </Button>
      </Form>
    </FormCard>
    {children}
  </Container>
);
