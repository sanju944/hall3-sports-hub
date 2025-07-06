import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type InventoryRow = Database['public']['Tables']['inventory']['Row'];
type InventoryInsert = Database['public']['Tables']['inventory']['Insert'];
type InventoryUpdate = Database['public']['Tables']['inventory']['Update'];

type UserRow = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

type IssueRow = Database['public']['Tables']['issues']['Row'];
type IssueInsert = Database['public']['Tables']['issues']['Insert'];
type IssueUpdate = Database['public']['Tables']['issues']['Update'];

type ReturnRequestRow = Database['public']['Tables']['return_requests']['Row'];
type ReturnRequestInsert = Database['public']['Tables']['return_requests']['Insert'];
type ReturnRequestUpdate = Database['public']['Tables']['return_requests']['Update'];

type NotificationRow = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

type AuthorizedStudentRow = Database['public']['Tables']['authorized_students']['Row'];
type AuthorizedStudentInsert = Database['public']['Tables']['authorized_students']['Insert'];

type TransferRequestRow = Database['public']['Tables']['transfer_requests']['Row'];
type TransferRequestInsert = Database['public']['Tables']['transfer_requests']['Insert'];
type TransferRequestUpdate = Database['public']['Tables']['transfer_requests']['Update'];

export const useSupabaseData = () => {
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [issues, setIssues] = useState<IssueRow[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequestRow[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [authorizedStudents, setAuthorizedStudents] = useState<AuthorizedStudentRow[]>([]);
  const [transferRequests, setTransferRequests] = useState<TransferRequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('added_date', { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('registered_date', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  const fetchReturnRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('return_requests')
        .select('*')
        .order('request_date', { ascending: false });

      if (error) throw error;
      setReturnRequests(data || []);
    } catch (error) {
      console.error('Error fetching return requests:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchAuthorizedStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('authorized_students')
        .select('*');

      if (error) throw error;
      setAuthorizedStudents(data || []);
    } catch (error) {
      console.error('Error fetching authorized students:', error);
    }
  };

  const fetchTransferRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('transfer_requests')
        .select('*')
        .order('request_date', { ascending: false });

      if (error) throw error;
      setTransferRequests(data || []);
    } catch (error) {
      console.error('Error fetching transfer requests:', error);
    }
  };

  const addAuthorizedStudents = async (students: { roll_number: string; name: string }[], replace: boolean = false) => {
    try {
      if (replace) {
        // Delete all existing authorized students if replacing
        const { error: deleteError } = await supabase
          .from('authorized_students')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
        
        if (deleteError && deleteError.code !== 'PGRST116') { // PGRST116 is "not found" which is ok
          console.error('Error clearing authorized students:', deleteError);
          throw deleteError;
        }
      }

      const { data, error } = await supabase
        .from('authorized_students')
        .insert(students)
        .select();

      if (error) throw error;

      if (replace) {
        setAuthorizedStudents(data || []);
      } else {
        setAuthorizedStudents(prev => [...prev, ...(data || [])]);
      }
    } catch (error) {
      console.error('Error adding authorized students:', error);
      throw error;
    }
  };

  const addInventoryItem = async (item: InventoryInsert) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      setInventory(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }
  };

  const updateInventoryItem = async (id: string, updates: InventoryUpdate) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setInventory(prev => prev.map(item => item.id === id ? data : item));
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setInventory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  };

  const addUser = async (user: UserInsert) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single();

      if (error) throw error;
      setUsers(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, updates: UserUpdate) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setUsers(prev => prev.map(user => user.id === id ? data : user));
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const addIssue = async (issue: IssueInsert) => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .insert(issue)
        .select()
        .single();

      if (error) throw error;
      setIssues(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding issue:', error);
      throw error;
    }
  };

  const updateIssue = async (id: string, updates: IssueUpdate) => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setIssues(prev => prev.map(issue => issue.id === id ? data : issue));
    } catch (error) {
      console.error('Error updating issue:', error);
      throw error;
    }
  };

  const addReturnRequest = async (request: ReturnRequestInsert) => {
    try {
      const { data, error } = await supabase
        .from('return_requests')
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      setReturnRequests(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding return request:', error);
      throw error;
    }
  };

  const updateReturnRequest = async (id: string, updates: ReturnRequestUpdate) => {
    try {
      const { data, error } = await supabase
        .from('return_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setReturnRequests(prev => prev.map(request => request.id === id ? data : request));
    } catch (error) {
      console.error('Error updating return request:', error);
      throw error;
    }
  };

  const addNotification = async (notification: NotificationInsert) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      if (error) throw error;
      setNotifications(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding notification:', error);
      throw error;
    }
  };

  const updateNotification = async (id: string, updates: NotificationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setNotifications(prev => prev.map(notification => notification.id === id ? data : notification));
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  };

  const addTransferRequest = async (request: TransferRequestInsert) => {
    try {
      const { data, error } = await supabase
        .from('transfer_requests')
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      setTransferRequests(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding transfer request:', error);
      throw error;
    }
  };

  const updateTransferRequest = async (id: string, updates: TransferRequestUpdate) => {
    try {
      const { data, error } = await supabase
        .from('transfer_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTransferRequests(prev => prev.map(request => request.id === id ? data : request));
    } catch (error) {
      console.error('Error updating transfer request:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchInventory(),
          fetchUsers(),
          fetchIssues(),
          fetchReturnRequests(),
          fetchNotifications(),
          fetchAuthorizedStudents(),
          fetchTransferRequests()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    inventory,
    users,
    issues,
    returnRequests,
    notifications,
    authorizedStudents,
    transferRequests,
    loading,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addUser,
    updateUser,
    addIssue,
    updateIssue,
    addReturnRequest,
    updateReturnRequest,
    addNotification,
    updateNotification,
    deleteNotification,
    addAuthorizedStudents,
    addTransferRequest,
    updateTransferRequest
  };
};
