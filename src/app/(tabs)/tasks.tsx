import { ClipboardList, Plus, Search, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

import { EmptyState } from '@/components/common/EmptyState';
import { AlertBanner } from '@/components/common/ErrorBanner';
import { LoadingState } from '@/components/common/LoadingState';
import { HeaderIconButton, ScreenHeader } from '@/components/common/ScreenHeader';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Text } from '@/components/ui/text';
import { AppColors } from '@/constants/colors';
import { useTasks } from '@/hooks/useTasks';
import type { TaskFilter } from '@/types/database';

const FILTER_OPTIONS: { key: TaskFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
];

export default function MyTasksScreen() {
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeaderSearchOpen, setIsHeaderSearchOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    filteredTasks,
    counts,
    isLoadingData,
    dataError,
    refreshAll,
    createTask,
  } = useTasks(activeFilter, searchQuery);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAll();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Microsoft Authenticator Header with Search + Plus Icons */}
      <ScreenHeader
        title="My Tasks"
        isSearchOpen={isHeaderSearchOpen}
        searchValue={searchQuery}
        searchPlaceholder="Search assignments or courses..."
        onSearchChange={setSearchQuery}
        onCloseSearch={() => {
          setIsHeaderSearchOpen(false);
          setSearchQuery('');
        }}
        rightSlot={
          <>
            <HeaderIconButton
              label="Search tasks"
              icon={<Search size={20} color="#FFFFFF" />}
              onPress={() => setIsHeaderSearchOpen(true)}
            />
            <HeaderIconButton
              label="Add new task"
              icon={<Plus size={22} color="#FFFFFF" />}
              onPress={() => setIsAddModalOpen(true)}
            />
          </>
        }
      />

      {/* Subtle Fluent Search Strip (when header search is closed, easy quick access) */}
      {!isHeaderSearchOpen ? (
        <View className="border-b border-[#EDEBE9] bg-[#FAF9F8] px-4 py-2.5">
          <View className="mx-auto w-full max-w-2xl flex-row items-center rounded-[4px] border border-[#EDEBE9] bg-white px-3">
            <Search size={16} color={AppColors.textSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Filter by assignment title or course..."
              placeholderTextColor={AppColors.textMuted}
              className="ml-2 flex-1 py-2 font-sans text-[14px] text-[#1B1A19]"
              style={{ outlineStyle: 'none' } as never}
            />
            {searchQuery.length > 0 ? (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <X size={15} color={AppColors.textSecondary} />
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Microsoft Fluent Underline Pivot Tabs */}
      <View className="border-b border-[#EDEBE9] bg-white">
        <View className="mx-auto w-full max-w-2xl flex-row px-2">
          {FILTER_OPTIONS.map((option) => {
            const isSelected = activeFilter === option.key;
            const count = counts[option.key];

            return (
              <Pressable
                key={option.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setActiveFilter(option.key)}
                className="relative flex-1 items-center py-3">
                <Text
                  size="sm"
                  weight={isSelected ? 'semibold' : 'regular'}
                  tone={isSelected ? 'brand' : 'secondary'}>
                  {option.label} ({count})
                </Text>
                {isSelected ? (
                  <View className="absolute bottom-0 left-3 right-3 h-[2.5px] rounded-t-full bg-[#0067B8]" />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView
        contentContainerClassName="pb-24"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={AppColors.primary}
            colors={[AppColors.primary]}
          />
        }>
        <View className="mx-auto w-full max-w-2xl">
          {dataError ? (
            <View className="p-4">
              <AlertBanner
                message={dataError}
                variant="error"
                actionLabel="Retry"
                onAction={handleRefresh}
              />
            </View>
          ) : null}

          {isLoadingData && counts.all === 0 ? (
            <LoadingState message="Loading assignments..." />
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              icon={<ClipboardList size={32} color={AppColors.primary} />}
              title={
                searchQuery.trim()
                  ? 'No matching assignments'
                  : activeFilter === 'completed'
                    ? 'No completed tasks yet'
                    : "Let's add your first task!"
              }
              description={
                searchQuery.trim()
                  ? 'Try another search keyword or switch between All, Pending, and Completed.'
                  : 'For university coursework tracking, tap Add task or the + button in the top bar.'
              }
              actionLabel={searchQuery.trim() ? 'Clear search' : 'Add task'}
              showAccentPlus={!searchQuery.trim()}
              onAction={() => {
                if (searchQuery.trim()) {
                  setSearchQuery('');
                } else {
                  setIsAddModalOpen(true);
                }
              }}
            />
          ) : (
            <View className="border-b border-[#EDEBE9]">
              {filteredTasks.map((task, idx) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isLast={idx === filteredTasks.length - 1}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Microsoft Authenticator Signature Circular Floating Action Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add assignment"
        onPress={() => setIsAddModalOpen(true)}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        }}
        className="absolute bottom-5 right-5 h-13 w-13 items-center justify-center rounded-full bg-[#0067B8] p-3.5 active:bg-[#005A9E]">
        <Plus size={24} color="#FFFFFF" />
      </Pressable>

      <CreateTaskModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (input) => {
          await createTask(input);
        }}
      />
    </View>
  );
}
