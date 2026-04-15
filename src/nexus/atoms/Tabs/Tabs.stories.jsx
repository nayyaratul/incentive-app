import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import { User, Settings, Bell, CreditCard, Shield } from 'lucide-react';

export default {
  title: 'Atoms/Tabs',
  component: Tabs,
  argTypes: {
    variant: { control: 'select', options: ['default', 'underline', 'pills'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

const content = {
  account: 'Manage your account settings, update your profile information, and configure your preferences.',
  notifications: 'Choose which notifications you receive. Configure email digests, push alerts, and in-app messages.',
  security: 'Set up two-factor authentication, manage sessions, and review recent login activity.',
};

export const Default = {
  render: () => (
    <div style={{ padding: '40px', maxWidth: '600px' }}>
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="account">{content.account}</TabsContent>
        <TabsContent value="notifications">{content.notifications}</TabsContent>
        <TabsContent value="security">{content.security}</TabsContent>
      </Tabs>
    </div>
  ),
};

export const Underline = {
  render: () => (
    <div style={{ padding: '40px', maxWidth: '600px' }}>
      <Tabs defaultValue="account" variant="underline">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="account">{content.account}</TabsContent>
        <TabsContent value="notifications">{content.notifications}</TabsContent>
        <TabsContent value="security">{content.security}</TabsContent>
      </Tabs>
    </div>
  ),
};

export const Pills = {
  render: () => (
    <div style={{ padding: '40px', maxWidth: '600px' }}>
      <Tabs defaultValue="account" variant="pills">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="account">{content.account}</TabsContent>
        <TabsContent value="notifications">{content.notifications}</TabsContent>
        <TabsContent value="security">{content.security}</TabsContent>
      </Tabs>
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={{ padding: '40px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {['sm', 'md', 'lg'].map((size) => (
        <div key={size}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>{size}</div>
          <Tabs defaultValue="tab1" size={size}>
            <TabsList>
              <TabsTrigger value="tab1">First</TabsTrigger>
              <TabsTrigger value="tab2">Second</TabsTrigger>
              <TabsTrigger value="tab3">Third</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Content for size {size}.</TabsContent>
            <TabsContent value="tab2">Second tab content.</TabsContent>
            <TabsContent value="tab3">Third tab content.</TabsContent>
          </Tabs>
        </div>
      ))}
    </div>
  ),
};

export const WithIcons = {
  render: () => (
    <div style={{ padding: '40px', maxWidth: '600px' }}>
      <Tabs defaultValue="profile" variant="underline">
        <TabsList>
          <TabsTrigger value="profile" icon={User}>Profile</TabsTrigger>
          <TabsTrigger value="settings" icon={Settings}>Settings</TabsTrigger>
          <TabsTrigger value="notifications" icon={Bell}>Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">Your profile information and avatar settings.</TabsContent>
        <TabsContent value="settings">Application settings and preferences.</TabsContent>
        <TabsContent value="notifications">Notification preferences and history.</TabsContent>
      </Tabs>
    </div>
  ),
};

export const Disabled = {
  render: () => (
    <div style={{ padding: '40px', maxWidth: '600px' }}>
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing" disabled>Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account settings. The Billing tab is disabled.</TabsContent>
        <TabsContent value="billing">You should not see this.</TabsContent>
        <TabsContent value="security">Security and privacy settings.</TabsContent>
      </Tabs>
    </div>
  ),
};

export const Vertical = {
  render: () => (
    <div style={{ padding: '40px', maxWidth: '600px' }}>
      <Tabs defaultValue="general" orientation="vertical">
        <TabsList>
          <TabsTrigger value="general" icon={Settings}>General</TabsTrigger>
          <TabsTrigger value="billing" icon={CreditCard}>Billing</TabsTrigger>
          <TabsTrigger value="security" icon={Shield}>Security</TabsTrigger>
        </TabsList>
        <TabsContent value="general">General application settings.</TabsContent>
        <TabsContent value="billing">Billing and subscription management.</TabsContent>
        <TabsContent value="security">Security and access control.</TabsContent>
      </Tabs>
    </div>
  ),
};
