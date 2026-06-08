const SUPABASE_URL = 'https://yqamnpacygddhbxzblyy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxYW1ucGFjeWdkZGhieHpibHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTA0MzUsImV4cCI6MjA5NDY4NjQzNX0.yHY_fRQx42ZaOStHyURfUORgPMnsJrvAyTS4QHdaNgY';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const formProduct = document.getElementById('produto');
    const formSpecs = document.getElementById('especificacoes');
    const formMakerWorld = document.getElementById('makerworld_url');
    const btnAddItem = document.getElementById('btnAddItem');
    const listContainer = document.getElementById('lista-impressoes');

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function renderQueue(items) {
        if (!items || items.length === 0) {
            listContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Nenhum item na fila. Comece adicionando um pedido acima.</p>';
            return;
        }

        listContainer.innerHTML = items.map(item => {
            const statusClass = item.status === 'Concluído'
                ? 'background: rgba(0, 255, 150, 0.08); color: #9AE6B4;'
                : item.status === 'Imprimindo'
                    ? 'background: rgba(59, 130, 246, 0.08); color: #60A5FA;'
                    : 'background: rgba(255, 184, 0, 0.08); color: #F6E05E;';

            const createdAt = item.created_at ? item.created_at : item.createdAt;
            return `
                <div style="border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; margin-bottom: 14px; background: rgba(255,255,255,0.03);">
                    <div style="display:flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap;">
                        <div style="flex:1; min-width: 220px;">
                            <strong style="display:block; font-size: 1rem; margin-bottom: 6px;">${item.produto}</strong>
                            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 10px; white-space: pre-line;">${item.especificacoes || 'Sem especificações adicionais.'}</p>
                            ${item.makerworld_url ? `<a href="${item.makerworld_url}" target="_blank" style="color: var(--primary-color); text-decoration: none; font-size: 0.9rem;">Ver no MakerWorld ↗</a>` : ''}
                        </div>
                        <div style="text-align: right; min-width: 140px;">
                            <span style="padding: 6px 10px; border-radius: 999px; font-size: 0.8rem; font-weight: 600; ${statusClass}">${item.status}</span>
                            <div style="margin-top: 12px; font-size: 0.75rem; color: var(--text-muted);">${createdAt ? formatDate(createdAt) : ''}</div>
                        </div>
                    </div>
                    <div style="display:flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; margin-top: 16px;">
                        <select onchange="updateStatus(${item.id}, this.value)" style="padding: 8px 10px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-main);">
                            <option value="Pendente" ${item.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                            <option value="Imprimindo" ${item.status === 'Imprimindo' ? 'selected' : ''}>Imprimindo</option>
                            <option value="Concluído" ${item.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
                        </select>
                        <button onclick="deleteItem(${item.id})" style="background: transparent; border: 1px solid #FF6B00; color: #FF6B00; border-radius: 8px; padding: 8px 12px; cursor:pointer;">Remover</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function fetchQueue() {
        const { data, error } = await supabaseClient
            .from('impressoes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar fila do Supabase:', error);
            listContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Não foi possível carregar a fila no momento. Tente novamente em instantes.</p>';
            return;
        }

        renderQueue(data || []);
    }

    async function addItem() {
        const produto = formProduct.value.trim();
        const especificacoes = formSpecs.value.trim();
        const makerworld_url = formMakerWorld.value.trim();

        if (!produto) {
            alert('Por favor, informe o nome do produto.');
            return;
        }

        const { error } = await supabaseClient
            .from('impressoes')
            .insert([{ produto, especificacoes, makerworld_url }]);

        if (error) {
            console.error('Erro ao adicionar item no Supabase:', error);
            alert('Erro ao adicionar item na fila. Verifique o console.');
            return;
        }

        formProduct.value = '';
        formSpecs.value = '';
        formMakerWorld.value = '';
        fetchQueue();
    }

    window.updateStatus = async (id, novoStatus) => {
        const { error } = await supabaseClient
            .from('impressoes')
            .update({ status: novoStatus })
            .eq('id', id);

        if (error) {
            console.error('Erro ao atualizar status:', error);
            return;
        }

        fetchQueue();
    };

    window.deleteItem = async (id) => {
        if (!confirm('Deseja remover este item da fila?')) return;

        const { error } = await supabaseClient
            .from('impressoes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao remover item:', error);
            return;
        }

        fetchQueue();
    };

    btnAddItem.addEventListener('click', addItem);

    fetchQueue();
});
