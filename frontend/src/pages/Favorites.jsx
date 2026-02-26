import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PromptCard from '../components/prompts/PromptCard';
import PromptForm from '../components/prompts/PromptForm';
import DeleteConfirm from '../components/prompts/DeleteConfirm';
import usePrompts from '../hooks/usePrompts';
import Spinner from '../components/common/Spinner';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const { prompts, loading, actionLoading, fetchPrompts, updatePrompt, deletePrompt, toggleFavorite, duplicatePrompt } = usePrompts();
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchPrompts({ isFavorite: true }); }, []);

  const handleFormSubmit = async (formData) => {
    const success = await updatePrompt(editingPrompt._id, formData);
    if (success) { setShowForm(false); setEditingPrompt(null); }
  };

  const handleEdit = (prompt) => { setEditingPrompt(prompt); setShowForm(true); };

  const handleToggleFavorite = async (id) => {
    await toggleFavorite(id);
    // Remove from list if unfavorited
    fetchPrompts({ isFavorite: true });
  };

  const handleDeleteConfirm = async () => {
    const success = await deletePrompt(deleteId);
    if (success) setDeleteId(null);
  };

  return (
    <DashboardLayout title="Favorites">
      <div className="mb-6">
        <p className="text-gray-500 font-body text-sm">{prompts.length} favorite prompts</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : prompts.length === 0 ? (
        <div className="card p-16 text-center">
          <Heart size={40} className="text-gray-600 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-white text-lg mb-2">No favorites yet</h3>
          <p className="text-gray-500 font-body text-sm mb-5">
            Mark prompts as favorites to see them here
          </p>
          <Link to="/prompts" className="btn-primary inline-flex">Browse Prompts</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {prompts.map(prompt => (
            <PromptCard
              key={prompt._id}
              prompt={prompt}
              onEdit={handleEdit}
              onDelete={setDeleteId}
              onToggleFavorite={handleToggleFavorite}
              onDuplicate={duplicatePrompt}
            />
          ))}
        </div>
      )}

      <PromptForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingPrompt(null); }}
        onSubmit={handleFormSubmit}
        initialData={editingPrompt}
        loading={actionLoading}
      />

      <DeleteConfirm
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
      />
    </DashboardLayout>
  );
};

export default Favorites;
