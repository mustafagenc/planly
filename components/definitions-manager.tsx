'use client';

import { useState } from 'react';
import {
	type Project,
	type Unit,
	type Person,
	type Setting,
	type SettingType,
} from '@/prisma/generated/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
	Trash2,
	Plus,
	Loader2,
	FolderOpen,
	Building2,
	Users,
	Settings,
	Pencil,
	Check,
	X,
} from 'lucide-react';
import {
	createProject,
	deleteProject,
	updateProject,
	createUnit,
	deleteUnit,
	updateUnit,
	createPerson,
	deletePerson,
	updatePerson,
} from '@/app/actions/definitions';
import { createSetting, updateSetting, deleteSetting } from '@/app/actions/settings';

interface DefinitionsManagerProps {
	projects: Project[];
	units: Unit[];
	people: Person[];
	settings: Setting[];
}

export function DefinitionsManager({ projects, units, people, settings }: DefinitionsManagerProps) {
	return (
		<Tabs defaultValue='projects' className='w-full space-y-6'>
			<TabsList className='inline-flex h-10 gap-1 rounded-xl bg-muted/60 p-1 backdrop-blur-sm'>
				<TabsTrigger
					value='projects'
					className='gap-2 rounded-lg px-4 data-[state=active]:shadow-sm'
				>
					<FolderOpen className='h-3.5 w-3.5' />
					Uygulama/Projeler
				</TabsTrigger>
				<TabsTrigger
					value='units'
					className='gap-2 rounded-lg px-4 data-[state=active]:shadow-sm'
				>
					<Building2 className='h-3.5 w-3.5' />
					Birimler
				</TabsTrigger>
				<TabsTrigger
					value='people'
					className='gap-2 rounded-lg px-4 data-[state=active]:shadow-sm'
				>
					<Users className='h-3.5 w-3.5' />
					Kişiler
				</TabsTrigger>
				<TabsTrigger
					value='settings'
					className='gap-2 rounded-lg px-4 data-[state=active]:shadow-sm'
				>
					<Settings className='h-3.5 w-3.5' />
					Ayarlar
				</TabsTrigger>
			</TabsList>

			<TabsContent value='projects' className='animate-in'>
				<DefinitionList
					title='Uygulama ve Projeler'
					description='Sistemdeki proje ve uygulamaları yönetin.'
					items={projects}
					onCreate={createProject}
					onUpdate={updateProject}
					onDelete={deleteProject}
					placeholder='Yeni proje adı...'
				/>
			</TabsContent>

			<TabsContent value='units' className='animate-in'>
				<DefinitionList
					title='Birimler'
					description='Talep eden veya çalışılan birimleri yönetin.'
					items={units}
					onCreate={createUnit}
					onUpdate={updateUnit}
					onDelete={deleteUnit}
					placeholder='Yeni birim adı...'
				/>
			</TabsContent>

			<TabsContent value='people' className='animate-in'>
				<DefinitionList
					title='Kişiler'
					description='Sorumlu kişileri yönetin.'
					items={people}
					onCreate={createPerson}
					onUpdate={updatePerson}
					onDelete={deletePerson}
					placeholder='Yeni kişi adı...'
				/>
			</TabsContent>

			<TabsContent value='settings' className='animate-in'>
				<SettingsList settings={settings} />
			</TabsContent>
		</Tabs>
	);
}

// ─── Definition List ───────────────────────────────────────────────

interface DefinitionListProps {
	title: string;
	description: string;
	items: { id: number; name: string }[];
	onCreate: (name: string) => Promise<{ success: boolean; error?: string }>;
	onUpdate: (id: number, name: string) => Promise<{ success: boolean; error?: string }>;
	onDelete: (id: number) => Promise<{ success: boolean; error?: string }>;
	placeholder: string;
}

function DefinitionList({
	title,
	description,
	items,
	onCreate,
	onUpdate,
	onDelete,
	placeholder,
}: DefinitionListProps) {
	const [newItemName, setNewItemName] = useState('');
	const [loading, setLoading] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editingName, setEditingName] = useState('');
	const [editLoading, setEditLoading] = useState(false);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newItemName.trim()) return;
		setLoading(true);
		const result = await onCreate(newItemName);
		setLoading(false);
		if (result.success) setNewItemName('');
		else alert(result.error);
	};

	const handleStartEdit = (item: { id: number; name: string }) => {
		setEditingId(item.id);
		setEditingName(item.name);
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setEditingName('');
	};

	const handleSaveEdit = async () => {
		if (!editingName.trim() || editingId === null) return;
		setEditLoading(true);
		const result = await onUpdate(editingId, editingName.trim());
		setEditLoading(false);
		if (result.success) {
			setEditingId(null);
			setEditingName('');
		} else alert(result.error);
	};

	const handleEditKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSaveEdit();
		} else if (e.key === 'Escape') handleCancelEdit();
	};

	const handleDelete = async (id: number) => {
		if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
		const result = await onDelete(id);
		if (!result.success) alert(result.error);
	};

	return (
		<Card className='border-border/60'>
			<CardHeader>
				<CardTitle className='text-lg'>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className='space-y-5'>
				<form onSubmit={handleCreate} className='flex gap-2'>
					<div className='grid w-full items-center gap-1.5'>
						<Label htmlFor='name' className='sr-only'>
							İsim
						</Label>
						<Input
							id='name'
							value={newItemName}
							onChange={(e) => setNewItemName(e.target.value)}
							placeholder={placeholder}
						/>
					</div>
					<Button type='submit' disabled={loading || !newItemName.trim()} size='sm'>
						{loading ? (
							<Loader2 className='h-4 w-4 animate-spin' />
						) : (
							<Plus className='h-4 w-4' />
						)}
						Ekle
					</Button>
				</form>

				<div className='rounded-xl border border-border/60 overflow-hidden'>
					{items.length === 0 ? (
						<div className='p-8 text-center text-sm text-muted-foreground/70'>
							Kayıt bulunamadı.
						</div>
					) : (
						<div className='divide-y divide-border/50'>
							{items.map((item) => (
								<div
									key={item.id}
									className='flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/30 transition-colors group'
								>
									{editingId === item.id ? (
										<div className='flex items-center gap-2 flex-1 mr-2'>
											<Input
												value={editingName}
												onChange={(e) => setEditingName(e.target.value)}
												onKeyDown={handleEditKeyDown}
												autoFocus
												className='flex-1'
											/>
											<Button
												variant='ghost'
												size='sm'
												className='h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700'
												onClick={handleSaveEdit}
												disabled={editLoading || !editingName.trim()}
											>
												{editLoading ? (
													<Loader2 className='h-3.5 w-3.5 animate-spin' />
												) : (
													<Check className='h-3.5 w-3.5' />
												)}
											</Button>
											<Button
												variant='ghost'
												size='sm'
												className='h-7 w-7 p-0 text-muted-foreground hover:text-foreground'
												onClick={handleCancelEdit}
												disabled={editLoading}
											>
												<X className='h-3.5 w-3.5' />
											</Button>
										</div>
									) : (
										<>
											<span className='font-medium'>{item.name}</span>
											<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
												<Button
													variant='ghost'
													size='sm'
													className='h-7 w-7 p-0 text-muted-foreground/60 hover:text-foreground'
													onClick={() => handleStartEdit(item)}
												>
													<Pencil className='h-3.5 w-3.5' />
												</Button>
												<Button
													variant='ghost'
													size='sm'
													className='h-7 w-7 p-0 text-muted-foreground/60 hover:text-destructive'
													onClick={() => handleDelete(item.id)}
												>
													<Trash2 className='h-3.5 w-3.5' />
												</Button>
											</div>
										</>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Settings List ─────────────────────────────────────────────────

const TYPE_LABELS: Record<SettingType, string> = {
	STRING: 'Metin',
	NUMBER: 'Sayı',
	BOOLEAN: 'Evet/Hayır',
	DATE: 'Tarih',
};

const TYPE_DEFAULTS: Record<SettingType, string> = {
	STRING: '',
	NUMBER: '0',
	BOOLEAN: 'false',
	DATE: new Date().toISOString().split('T')[0],
};

interface NewSettingForm {
	key: string;
	label: string;
	description: string;
	type: SettingType;
	value: string;
}

const EMPTY_FORM: NewSettingForm = {
	key: '',
	label: '',
	description: '',
	type: 'STRING',
	value: '',
};

function SettingsList({ settings }: { settings: Setting[] }) {
	const [showForm, setShowForm] = useState(false);
	const [form, setForm] = useState<NewSettingForm>(EMPTY_FORM);
	const [loading, setLoading] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editValue, setEditValue] = useState('');
	const [editLabel, setEditLabel] = useState('');
	const [editLoading, setEditLoading] = useState(false);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.key.trim() || !form.label.trim()) return;
		setLoading(true);
		const result = await createSetting({
			key: form.key.trim(),
			label: form.label.trim(),
			description: form.description.trim() || undefined,
			type: form.type,
			value: form.value || TYPE_DEFAULTS[form.type],
		});
		setLoading(false);
		if (result.success) {
			setForm(EMPTY_FORM);
			setShowForm(false);
		} else alert(result.error);
	};

	const handleStartEdit = (setting: Setting) => {
		setEditingId(setting.id);
		setEditValue(setting.value);
		setEditLabel(setting.label);
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setEditValue('');
		setEditLabel('');
	};

	const handleSaveEdit = async () => {
		if (editingId === null) return;
		setEditLoading(true);
		const result = await updateSetting(editingId, { value: editValue, label: editLabel });
		setEditLoading(false);
		if (result.success) handleCancelEdit();
		else alert(result.error);
	};

	const handleEditKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSaveEdit();
		} else if (e.key === 'Escape') handleCancelEdit();
	};

	const handleDelete = async (id: number) => {
		if (!confirm('Bu ayarı silmek istediğinize emin misiniz?')) return;
		const result = await deleteSetting(id);
		if (!result.success) alert(result.error);
	};

	const handleBooleanToggle = async (setting: Setting) => {
		const newValue = setting.value === 'true' ? 'false' : 'true';
		await updateSetting(setting.id, { value: newValue });
	};

	const set = (key: keyof NewSettingForm, value: string) =>
		setForm((prev) => ({ ...prev, [key]: value }));

	return (
		<Card className='border-border/60'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='text-lg'>Ayarlar</CardTitle>
						<CardDescription>
							Uygulama genelinde kullanılacak ayarları yönetin.
						</CardDescription>
					</div>
					{!showForm && (
						<Button size='sm' onClick={() => setShowForm(true)}>
							<Plus className='h-4 w-4' /> Yeni Ayar
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent className='space-y-5'>
				{showForm && (
					<form
						onSubmit={handleCreate}
						className='rounded-xl border border-border/60 p-4 space-y-4 bg-muted/20'
					>
						<div className='grid grid-cols-2 gap-3'>
							<div className='space-y-1.5'>
								<Label>Anahtar (key)</Label>
								<Input
									value={form.key}
									onChange={(e) => set('key', e.target.value)}
									placeholder='ornek_ayar'
									required
								/>
							</div>
							<div className='space-y-1.5'>
								<Label>Etiket</Label>
								<Input
									value={form.label}
									onChange={(e) => set('label', e.target.value)}
									placeholder='Örnek Ayar'
									required
								/>
							</div>
						</div>
						<div className='grid grid-cols-2 gap-3'>
							<div className='space-y-1.5'>
								<Label>Tip</Label>
								<Select value={form.type} onValueChange={(v) => set('type', v)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='STRING'>Metin</SelectItem>
										<SelectItem value='NUMBER'>Sayı</SelectItem>
										<SelectItem value='BOOLEAN'>Evet/Hayır</SelectItem>
										<SelectItem value='DATE'>Tarih</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className='space-y-1.5'>
								<Label>Değer</Label>
								<SettingValueInput
									type={form.type}
									value={form.value}
									onChange={(v) => set('value', v)}
								/>
							</div>
						</div>
						<div className='space-y-1.5'>
							<Label>Açıklama (Opsiyonel)</Label>
							<Input
								value={form.description}
								onChange={(e) => set('description', e.target.value)}
								placeholder='Bu ayar ne için kullanılıyor?'
							/>
						</div>
						<div className='flex justify-end gap-2'>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => {
									setShowForm(false);
									setForm(EMPTY_FORM);
								}}
							>
								İptal
							</Button>
							<Button
								type='submit'
								size='sm'
								disabled={loading || !form.key.trim() || !form.label.trim()}
							>
								{loading && <Loader2 className='h-4 w-4 animate-spin mr-1' />}
								Oluştur
							</Button>
						</div>
					</form>
				)}

				<div className='rounded-xl border border-border/60 overflow-hidden'>
					{settings.length === 0 ? (
						<div className='p-8 text-center text-sm text-muted-foreground/70'>
							Henüz ayar eklenmemiş.
						</div>
					) : (
						<div className='divide-y divide-border/50'>
							{settings.map((setting) => (
								<div
									key={setting.id}
									className='px-4 py-3 hover:bg-muted/30 transition-colors group'
								>
									{editingId === setting.id ? (
										<div className='space-y-3'>
											<div className='grid grid-cols-2 gap-3'>
												<div className='space-y-1'>
													<Label className='text-xs text-muted-foreground'>
														Etiket
													</Label>
													<Input
														value={editLabel}
														onChange={(e) =>
															setEditLabel(e.target.value)
														}
														onKeyDown={handleEditKeyDown}
														autoFocus
													/>
												</div>
												<div className='space-y-1'>
													<Label className='text-xs text-muted-foreground'>
														Değer
													</Label>
													<SettingValueInput
														type={setting.type}
														value={editValue}
														onChange={setEditValue}
														onKeyDown={handleEditKeyDown}
													/>
												</div>
											</div>
											<div className='flex justify-end gap-1'>
												<Button
													variant='ghost'
													size='sm'
													className='h-7 text-emerald-600 hover:text-emerald-700'
													onClick={handleSaveEdit}
													disabled={editLoading}
												>
													{editLoading ? (
														<Loader2 className='h-3.5 w-3.5 animate-spin mr-1' />
													) : (
														<Check className='h-3.5 w-3.5 mr-1' />
													)}
													Kaydet
												</Button>
												<Button
													variant='ghost'
													size='sm'
													className='h-7'
													onClick={handleCancelEdit}
													disabled={editLoading}
												>
													<X className='h-3.5 w-3.5 mr-1' /> İptal
												</Button>
											</div>
										</div>
									) : (
										<div className='flex items-center justify-between'>
											<div className='space-y-0.5 min-w-0 flex-1'>
												<div className='flex items-center gap-2'>
													<span className='font-medium text-sm'>
														{setting.label}
													</span>
													<span className='text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground'>
														{setting.key}
													</span>
													<span className='text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium'>
														{TYPE_LABELS[setting.type]}
													</span>
												</div>
												{setting.description && (
													<p className='text-xs text-muted-foreground/70'>
														{setting.description}
													</p>
												)}
											</div>
											<div className='flex items-center gap-3 shrink-0'>
												{setting.type === 'BOOLEAN' ? (
													<Switch
														checked={setting.value === 'true'}
														onCheckedChange={() =>
															handleBooleanToggle(setting)
														}
													/>
												) : (
													<span className='text-sm font-semibold tabular-nums'>
														{setting.value}
													</span>
												)}
												<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
													<Button
														variant='ghost'
														size='sm'
														className='h-7 w-7 p-0 text-muted-foreground/60 hover:text-foreground'
														onClick={() => handleStartEdit(setting)}
													>
														<Pencil className='h-3.5 w-3.5' />
													</Button>
													<Button
														variant='ghost'
														size='sm'
														className='h-7 w-7 p-0 text-muted-foreground/60 hover:text-destructive'
														onClick={() => handleDelete(setting.id)}
													>
														<Trash2 className='h-3.5 w-3.5' />
													</Button>
												</div>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Value Input (tip bazlı) ───────────────────────────────────────

function SettingValueInput({
	type,
	value,
	onChange,
	onKeyDown,
}: {
	type: SettingType;
	value: string;
	onChange: (v: string) => void;
	onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
	switch (type) {
		case 'BOOLEAN':
			return (
				<div className='flex items-center h-9'>
					<Switch
						checked={value === 'true'}
						onCheckedChange={(checked) => onChange(checked ? 'true' : 'false')}
					/>
					<span className='ml-2 text-sm text-muted-foreground'>
						{value === 'true' ? 'Evet' : 'Hayır'}
					</span>
				</div>
			);
		case 'NUMBER':
			return (
				<Input
					type='number'
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={onKeyDown}
					placeholder='0'
				/>
			);
		case 'DATE':
			return (
				<Input
					type='date'
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={onKeyDown}
				/>
			);
		default:
			return (
				<Input
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={onKeyDown}
					placeholder='Değer girin...'
				/>
			);
	}
}
