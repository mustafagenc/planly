'use client';

import { useState } from 'react';
import { Project, Unit, Person } from '@/prisma/generated/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Loader2, FolderOpen, Building2, Users } from 'lucide-react';
import { createProject, deleteProject, createUnit, deleteUnit, createPerson, deletePerson } from '@/app/actions/definitions';

interface DefinitionsManagerProps {
    projects: Project[];
    units: Unit[];
    people: Person[];
}

export function DefinitionsManager({ projects, units, people }: DefinitionsManagerProps) {
    return (
        <Tabs defaultValue="projects" className="w-full space-y-6">
            <TabsList className="inline-flex h-10 gap-1 rounded-xl bg-muted/60 p-1 backdrop-blur-sm">
                <TabsTrigger value="projects" className="gap-2 rounded-lg px-4 data-[state=active]:shadow-sm">
                    <FolderOpen className="h-3.5 w-3.5" />
                    Uygulama/Projeler
                </TabsTrigger>
                <TabsTrigger value="units" className="gap-2 rounded-lg px-4 data-[state=active]:shadow-sm">
                    <Building2 className="h-3.5 w-3.5" />
                    Birimler
                </TabsTrigger>
                <TabsTrigger value="people" className="gap-2 rounded-lg px-4 data-[state=active]:shadow-sm">
                    <Users className="h-3.5 w-3.5" />
                    Kişiler
                </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="animate-in">
                <DefinitionList
                    title="Uygulama ve Projeler"
                    description="Sistemdeki proje ve uygulamaları yönetin."
                    items={projects}
                    onCreate={createProject}
                    onDelete={deleteProject}
                    placeholder="Yeni proje adı..."
                />
            </TabsContent>

            <TabsContent value="units" className="animate-in">
                <DefinitionList
                    title="Birimler"
                    description="Talep eden veya çalışılan birimleri yönetin."
                    items={units}
                    onCreate={createUnit}
                    onDelete={deleteUnit}
                    placeholder="Yeni birim adı..."
                />
            </TabsContent>

            <TabsContent value="people" className="animate-in">
                <DefinitionList
                    title="Kişiler"
                    description="Sorumlu kişileri yönetin."
                    items={people}
                    onCreate={createPerson}
                    onDelete={deletePerson}
                    placeholder="Yeni kişi adı..."
                />
            </TabsContent>
        </Tabs>
    );
}

interface DefinitionListProps {
    title: string;
    description: string;
    items: { id: number; name: string }[];
    onCreate: (name: string) => Promise<{ success: boolean; error?: string }>;
    onDelete: (id: number) => Promise<{ success: boolean; error?: string }>;
    placeholder: string;
}

function DefinitionList({ title, description, items, onCreate, onDelete, placeholder }: DefinitionListProps) {
    const [newItemName, setNewItemName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        setLoading(true);
        const result = await onCreate(newItemName);
        setLoading(false);

        if (result.success) {
            setNewItemName('');
        } else {
            alert(result.error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;

        const result = await onDelete(id);
        if (!result.success) {
            alert(result.error);
        }
    };

    return (
        <Card className="border-border/60">
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <form onSubmit={handleCreate} className="flex gap-2">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="name" className="sr-only">İsim</Label>
                        <Input
                            id="name"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder={placeholder}
                            className="h-9"
                        />
                    </div>
                    <Button type="submit" disabled={loading || !newItemName.trim()} size="sm" className="h-9 px-4">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Ekle
                    </Button>
                </form>

                <div className="rounded-xl border border-border/60 overflow-hidden">
                    {items.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground/70">
                            Kayıt bulunamadı.
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/30 transition-colors">
                                    <span className="font-medium">{item.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="h-7 w-7 text-muted-foreground/60 hover:text-destructive"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span className="sr-only">Sil</span>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
