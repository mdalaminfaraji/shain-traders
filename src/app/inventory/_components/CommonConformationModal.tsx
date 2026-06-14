import React from 'react'

const CommonConformationModal = ({
    showModal,
    setShowModal,
    title,
    message,
    onConfirm,
}:{
    showModal: boolean;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    title: string;
    message: string;
    onConfirm: () => void;
}) => {
  return (
    <>
        {showModal && (
             <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded-lg">
                <div className="bg-white p-4 rounded-lg text-black">
                    <h2 className="text-lg font-bold text-center">{title}</h2>
                    <p className="text-sm ">{message}</p>
                </div>
                <div className="flex gap-2 pt-3 justify-end">
                    <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg cursor-pointer hover:bg-gray-600 transition-all">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded-lg cursor-pointer hover:bg-red-600 transition-all">Confirm</button>
                </div>
            </div>
             </div>
        )}
    </>
  )
}

export default CommonConformationModal