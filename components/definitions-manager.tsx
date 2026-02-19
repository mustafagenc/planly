'use client';

import { useState } from 'react';
import { Project, Unit, Person } from '@/prisma/generated/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { createProject, deleteProject, createUnit, deleteUnit, createPerson, deletePerson } from '@/app/actions/definitions';

interface DefinitionsManagerProps {
    projects: Project[];
    units: Unit[];
    people: Person[];
}

export function DefinitionsManager({ projects, units, people }: DefinitionsManagerProps) {
    return (
        <Tabs defaultValue="projects" className="w-full space-y-6">
            <TabsList>
                <TabsTrigger value="projects">Uygulama/Projeler</TabsTrigger>
                <TabsTrigger value="units">Birimler</TabsTrigger>
                <TabsTrigger value="people">Kişiler</TabsTrigger>
            </TabsList>

            <TabsContent value="projects">
                <DefinitionList
                    title="Uygulama ve Projeler"
                    description="Sistemdeki proje ve uygulamaları yönetin."
                    items={projects}
                    onCreate={createProject}
                    onDelete={deleteProject}
                    placeholder="Yeni proje adı..."
                />
            </TabsContent>

            <TabsContent value="units">
                <DefinitionList
                    title="Birimler"
                    description="Talep eden veya çalışılan birimleri yönetin."
                    items={units}
                    onCreate={createUnit}
                    onDelete={deleteUnit}
                    placeholder="Yeni birim adı..."
                />
            </TabsContent>

            <TabsContent value="people">
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
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={handleCreate} className="flex gap-2">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="name" className="sr-only">İsim</Label>
                        <Input
                            id="name"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder={placeholder}
                        />
                    </div>
                    <Button type="submit" disabled={loading || !newItemName.trim()}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Ekle
                    </Button>
                </form>

                <div className="rounded-md border">
                    {items.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Kayıt bulunamadı.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 text-sm">
                                    <span>{item.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
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
