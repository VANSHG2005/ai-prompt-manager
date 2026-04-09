import { useState, useEffect } from 'react';
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
    fetchPrompts({ isFavorite: true });
  };

  const handleDeleteConfirm = async () => {
    const success = await deletePrompt(deleteId);
    if (success) setDeleteId(null);
  };

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: '12.5px', color: 'var(--text-tertiary)' }}>
          {prompts.length} favourite prompt{prompts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px' }}>
          <Spinner size="lg" />
        </div>
      ) : prompts.length === 0 ? (
        <div className="empty-state-pv">
          <div className="empty-icon-pv">
            <Heart size={22} />
          </div>
          <div className="empty-title-pv">No favourites yet</div>
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '20px' }}>
            Mark prompts as favourites to see them here
          </p>
          <Link to="/prompts" className="btn-pv btn-primary-pv" style={{ gap: '6px', textDecoration: 'none' }}>
            Browse prompts
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
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
    </>
  );
};

export default Favorites;
