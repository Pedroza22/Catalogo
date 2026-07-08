'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { getAllUsers, updateUserRole, deleteUser } from '@/lib/application/services/auth-service'
import { Users, Loader2, Shield, Trash2, Phone, MapPin, CreditCard, Search, Filter } from 'lucide-react'
import { toast } from 'sonner'
import type { User, Role } from '@/lib/domain/entities'

export default function ClientesPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  useEffect(() => {
    getAllUsers().then((data) => {
      setUsers(data)
      setFilteredUsers(data)
      setLoading(false)
    })
  }, [])

  // Filter users based on search and role
  useEffect(() => {
    let filtered = [...users]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(user => 
        user.fullName?.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user.address?.toLowerCase().includes(query)
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [searchQuery, roleFilter, users])

  const handleUpdateRole = async (newRole: Role) => {
    if (!selectedUser) return

    setUpdating(true)
    const result = await updateUserRole(selectedUser.id, newRole)

    if (result.error) {
      toast.error(result.error)
      setUpdating(false)
      return
    }

    toast.success('Rol actualizado correctamente')
    setRoleDialogOpen(false)
    setUpdating(false)
    const updated = await getAllUsers()
    setUsers(updated)
    router.refresh()
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setDeleting(true)
    const result = await deleteUser(selectedUser.id)

    if (result.error) {
      toast.error(result.error)
      setDeleting(false)
      return
    }

    toast.success('Usuario eliminado correctamente')
    setDeleteDialogOpen(false)
    setDeleting(false)
    const updated = await getAllUsers()
    setUsers(updated)
    router.refresh()
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">Administra los roles y permisos de los usuarios</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>{filteredUsers.length} usuarios encontrados</CardDescription>
            </div>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email, teléfono o dirección..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="cliente">Clientes</SelectItem>
                  <SelectItem value="bodeguero">Bodegueros</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay usuarios</h3>
              <p className="text-muted-foreground">
                {searchQuery || roleFilter !== 'all' 
                ? 'Intenta con otros términos de búsqueda'
                : 'Los usuarios registrados aparecerán aquí'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-muted/50">Nombre</TableHead>
                    <TableHead className="bg-muted/50">Email</TableHead>
                    <TableHead className="bg-muted/50">Teléfono</TableHead>
                    <TableHead className="bg-muted/50">Dirección</TableHead>
                    <TableHead className="bg-muted/50">Crédito</TableHead>
                    <TableHead className="bg-muted/50">Rol</TableHead>
                    <TableHead className="bg-muted/50">Registro</TableHead>
                    <TableHead className="bg-muted/50 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">{user.fullName || 'Sin nombre'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {user.phone || 'No disponible'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3 mt-0.5" />
                          <span className="line-clamp-2 max-w-[200px]">{user.address || 'No disponible'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <CreditCard className="h-3 w-3" />
                          <span>
                            ${user.creditUsed.toLocaleString('es-CO')} / ${user.creditLimit.toLocaleString('es-CO')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : user.role === 'bodeguero' ? 'secondary' : 'outline'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('es-CO')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedUser(user)
                              setRoleDialogOpen(true)
                            }}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setSelectedUser(user)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
            <DialogDescription>
              Selecciona el nuevo rol para {selectedUser?.fullName || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Rol actual: <span className="capitalize font-bold">{selectedUser?.role}</span></p>
              <Select 
                defaultValue={selectedUser?.role} 
                onValueChange={(v) => handleUpdateRole(v as Role)}
                disabled={updating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente (Usuario normal)</SelectItem>
                  <SelectItem value="bodeguero">Bodeguero (Gestión de stock y pedidos)</SelectItem>
                  <SelectItem value="admin">Administrador (Control total)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {updating && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Actualizando rol...
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar a {selectedUser?.fullName || selectedUser?.email}?
              <br />
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
